import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  console.log('[STRIPE WEBHOOK] Received webhook call')
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!
  console.log(`[STRIPE WEBHOOK] Signature: ${signature ? 'Present' : 'Missing'}`)

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // Use service role for webhook operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    console.log(`[STRIPE WEBHOOK] Processing event type: ${event.type}`)
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log(`[STRIPE WEBHOOK] Processing checkout.session.completed`)
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.payment_status === 'paid') {
          // Update order status to paid
          if (session.metadata?.orderData) {
            const orderData = JSON.parse(session.metadata.orderData)
            
            // Create order in database if not already created (check by session_id for better uniqueness)
            const { data: existingOrder } = await supabase
              .from('orders')
              .select('id')
              .eq('stripe_session_id', session.id)
              .single()

            if (!existingOrder) {
              console.log(`Creating new order for session: ${session.id}`)
              
              // Debug: Log all Stripe amounts in cents first
              console.log(`Stripe raw amounts (cents) - amount_total: ${session.amount_total}, amount_subtotal: ${session.amount_subtotal}`)
              console.log(`Stripe total_details:`, session.total_details)
              
              // Calculate amounts from Stripe data using precise decimal arithmetic
              const subtotalCents = session.amount_subtotal || 0
              const taxCents = session.total_details?.amount_tax || 0
              const shippingCents = session.total_details?.amount_shipping || 0
              const totalCents = session.amount_total || 0
              
              // Convert to dollars using string to avoid floating point errors
              const subtotalAmount = parseFloat((subtotalCents / 100).toFixed(2))
              const taxAmount = parseFloat((taxCents / 100).toFixed(2))
              const shippingAmount = parseFloat((shippingCents / 100).toFixed(2))
              const stripeTotal = parseFloat((totalCents / 100).toFixed(2))
              
              // If no tax or shipping, use subtotal as total. Otherwise use Stripe's amount_total
              const totalAmount = (taxAmount === 0 && shippingAmount === 0) ? subtotalAmount : stripeTotal
              
              console.log(`Order amounts (from cents) - Subtotal: ${subtotalCents}¢ = $${subtotalAmount}, Tax: ${taxCents}¢ = $${taxAmount}, Shipping: ${shippingCents}¢ = $${shippingAmount}`)
              console.log(`Stripe Total: ${totalCents}¢ = $${stripeTotal}, Using: $${totalAmount}`)
              console.log(`Exact values being inserted - total_amount: ${totalAmount}, subtotal: ${subtotalAmount}`)
              
              const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                  stripe_payment_intent_id: session.payment_intent as string,
                  stripe_session_id: session.id,
                  customer_name: session.customer_details?.name || null,
                  customer_email: session.customer_details?.email || null,
                  total_amount: totalAmount,
                  subtotal: subtotalAmount,
                  tax_amount: taxAmount,
                  shipping_amount: shippingAmount,
                  status: 'paid',
                  payment_method: 'stripe',
                  items: orderData.items || [],
                  shipping_address: orderData.shippingAddress,
                  user_id: null // Anonymous order
                })
                .select()
                .single()

              if (orderError) {
                console.error('Error creating order:', orderError)
                break
              }

              console.log(`Order created successfully: ${order.id} for session: ${session.id}`)
              console.log(`Database record created:`, {
                id: order.id,
                total_amount: order.total_amount,
                subtotal: order.subtotal,
                tax_amount: order.tax_amount,
                shipping_amount: order.shipping_amount
              })

              // Insert order items
              if (order && orderData.items) {
                const orderItems = orderData.items.map((item: { id: string; quantity: number; price: number }) => ({
                  order_id: order.id,
                  product_id: item.id,
                  quantity: item.quantity,
                  price: item.price
                }))

                const { error: itemsError } = await supabase
                  .from('order_items')
                  .insert(orderItems)

                if (itemsError) {
                  console.error('Error creating order items:', itemsError)
                }
              }

              // Create order snapshot for data integrity
              if (order) {
                try {
                  // Call the Supabase function to create snapshot
                  const { error: snapshotError } = await supabase.rpc('create_order_snapshot', {
                    order_id: order.id
                  })
                  
                  if (snapshotError) {
                    console.error('Failed to create order snapshot:', snapshotError)
                  } else {
                    console.log('Order snapshot created for order:', order.id)
                  }
                } catch (snapshotError) {
                  console.error('Failed to create order snapshot:', snapshotError)
                  // Don't fail the entire order if snapshot creation fails
                }
              }
            } else {
              console.log(`Order already exists for session: ${session.id}`)
            }
          }
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Update order status
        await supabase
          .from('orders')
          .update({ status: 'processing' })
          .eq('stripe_payment_intent_id', paymentIntent.id)
        
        console.log(`PaymentIntent succeeded: ${paymentIntent.id}`)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Update order status
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('stripe_payment_intent_id', paymentIntent.id)
        
        console.log(`PaymentIntent failed: ${paymentIntent.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error('Error handling webhook event:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}