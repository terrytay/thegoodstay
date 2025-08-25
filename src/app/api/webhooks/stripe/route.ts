import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

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

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.payment_status === 'paid') {
          // Update order status to paid
          if (session.metadata?.orderData) {
            const orderData = JSON.parse(session.metadata.orderData)
            
            // Create order in database if not already created
            const { data: existingOrder } = await supabase
              .from('orders')
              .select('id')
              .eq('stripe_payment_intent_id', session.payment_intent as string)
              .single()

            if (!existingOrder) {
              const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                  stripe_payment_intent_id: session.payment_intent as string,
                  total_amount: orderData.total,
                  status: 'paid',
                  shipping_address: orderData.shippingAddress
                })
                .select()
                .single()

              if (orderError) {
                console.error('Error creating order:', orderError)
                break
              }

              // Insert order items
              if (order && orderData.items) {
                const orderItems = orderData.items.map((item: any) => ({
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