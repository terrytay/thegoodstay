import { createClient } from '@/lib/supabase/client'

// Create comprehensive order snapshot
export async function createOrderSnapshot(orderId: string) {
  try {
    const supabase = createClient()

    // Get order data
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError) throw orderError

    // Get associated product data at time of order
    const orderItems = orderData.items || []
    const productSnapshots = []

    for (const item of orderItems) {
      if (item.product_id) {
        const { data: productData } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.product_id)
          .single()

        if (productData) {
          productSnapshots.push({
            product_id: item.product_id,
            snapshot_data: productData,
            quantity_ordered: item.quantity,
            price_at_time: item.price
          })
        }
      }
    }

    // Get current business settings
    const { data: businessSettings } = await supabase
      .from('cms_business_settings')
      .select('*')

    // Get current policies
    const { data: policies } = await supabase
      .from('cms_business_settings')
      .select('*')
      .eq('category', 'policies')

    // Create comprehensive snapshot
    const snapshotData = {
      order_id: orderId,
      product_data: {
        order_items: orderItems,
        product_snapshots: productSnapshots
      },
      business_data: businessSettings || [],
      pricing_data: {
        subtotal: orderData.subtotal,
        tax_amount: orderData.tax_amount,
        shipping_amount: orderData.shipping_amount,
        discount_amount: orderData.discount_amount,
        total_amount: orderData.total_amount,
        currency: 'USD',
        payment_method: orderData.payment_method
      },
      policies_data: policies || [],
      shipping_data: {
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address
      },
      tax_data: {
        tax_rate: orderData.tax_rate || 0,
        tax_amount: orderData.tax_amount || 0
      },
      discount_data: {
        discount_code: orderData.discount_code,
        discount_amount: orderData.discount_amount || 0,
        discount_type: orderData.discount_type
      }
    }

    const { data, error } = await supabase
      .from('order_snapshots')
      .insert(snapshotData)
      .select()
      .single()

    if (error) throw error

    console.log('Order snapshot created:', data.id)
    return data.id

  } catch (error) {
    console.error('Error creating order snapshot:', error)
    throw error
  }
}

// Create comprehensive booking snapshot
export async function createBookingSnapshot(bookingId: string) {
  try {
    const supabase = createClient()

    // Get booking data
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (bookingError) throw bookingError

    // Get service data
    const { data: serviceData } = await supabase
      .from('cms_services')
      .select('*')
      .eq('slug', 'assessment-visit')
      .single()

    // Get current business settings
    const { data: businessSettings } = await supabase
      .from('cms_business_settings')
      .select('*')

    // Get booking settings at time of booking
    const { data: bookingSettings } = await supabase
      .from('booking_settings')
      .select('*')

    // Get current policies
    const { data: policies } = await supabase
      .from('cms_business_settings')
      .select('*')
      .eq('category', 'policies')

    // Create comprehensive snapshot
    const snapshotData = {
      booking_id: bookingId,
      service_data: {
        service_info: serviceData || null,
        booking_type: 'assessment-visit',
        duration: 45, // minutes
        location: 'service_provider_location'
      },
      business_data: businessSettings || [],
      booking_settings: bookingSettings || [],
      pricing_data: {
        service_price: 0, // Assessment visits are free
        currency: 'USD',
        payment_required: false
      },
      policies_data: policies || []
    }

    const { data, error } = await supabase
      .from('booking_snapshots')
      .insert(snapshotData)
      .select()
      .single()

    if (error) throw error

    console.log('Booking snapshot created:', data.id)
    return data.id

  } catch (error) {
    console.error('Error creating booking snapshot:', error)
    throw error
  }
}

// Get order snapshot for historical reference
export async function getOrderSnapshot(orderId: string) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('order_snapshots')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error
    return data

  } catch (error) {
    console.error('Error getting order snapshot:', error)
    return null
  }
}

// Get booking snapshot for historical reference
export async function getBookingSnapshot(bookingId: string) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('booking_snapshots')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error
    return data

  } catch (error) {
    console.error('Error getting booking snapshot:', error)
    return null
  }
}

// Create service pricing history entry
export async function createPricingHistory(serviceType: string, pricingData: any, notes?: string) {
  try {
    const supabase = createClient()
    
    // End any current pricing period
    await supabase
      .from('service_pricing_history')
      .update({ effective_to: new Date().toISOString() })
      .eq('service_type', serviceType)
      .is('effective_to', null)

    // Create new pricing entry
    const { data, error } = await supabase
      .from('service_pricing_history')
      .insert({
        service_type: serviceType,
        pricing_data: pricingData,
        effective_from: new Date().toISOString(),
        notes: notes || 'Pricing update',
        created_by: 'system'
      })
      .select()
      .single()

    if (error) throw error

    console.log('Pricing history created:', data.id)
    return data.id

  } catch (error) {
    console.error('Error creating pricing history:', error)
    throw error
  }
}

// Get pricing at a specific date
export async function getPricingAtDate(serviceType: string, date: Date) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('service_pricing_history')
      .select('*')
      .eq('service_type', serviceType)
      .lte('effective_from', date.toISOString())
      .or(`effective_to.is.null,effective_to.gte.${date.toISOString()}`)
      .order('effective_from', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error
    return data

  } catch (error) {
    console.error('Error getting pricing at date:', error)
    return null
  }
}