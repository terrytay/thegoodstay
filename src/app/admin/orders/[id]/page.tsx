'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  CreditCard, 
  Calendar,
  Phone,
  Mail,
  Edit,
  Trash2,
  Download,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  total_amount: number
  subtotal: number
  tax_amount: number
  shipping_amount: number
  status: string
  stripe_payment_intent_id: string
  stripe_session_id: string
  customer_name: string | null
  customer_email: string | null
  payment_method: string
  items: any[]
  shipping_address: any
  notes: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price: number
  products?: {
    name: string
    image_url: string
    category: string
  }
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchOrder()
    }
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              image_url,
              category
            )
          )
        `)
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Error fetching order:', error)
        router.push('/admin/orders')
        return
      }

      setOrder(data)
      setNotes(data.notes || '')
    } catch (err) {
      console.error('Error:', err)
      router.push('/admin/orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return

    setUpdating(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id)

      if (error) {
        console.error('Error updating order status:', error)
        return
      }

      setOrder(prev => prev ? { ...prev, status: newStatus } : null)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setUpdating(false)
    }
  }

  const updateNotes = async () => {
    if (!order) return

    setUpdating(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('orders')
        .update({ notes })
        .eq('id', order.id)

      if (error) {
        console.error('Error updating notes:', error)
        return
      }

      setOrder(prev => prev ? { ...prev, notes } : null)
      setEditingNotes(false)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setUpdating(false)
    }
  }

  const deleteOrder = async () => {
    if (!order || !confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return
    }

    setUpdating(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', order.id)

      if (error) {
        console.error('Error deleting order:', error)
        return
      }

      router.push('/admin/orders')
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const formatAddress = (address: any) => {
    if (!address) return 'No address provided'
    
    const parts = []
    if (address.line1) parts.push(address.line1)
    if (address.line2) parts.push(address.line2)
    if (address.city) parts.push(address.city)
    if (address.state) parts.push(address.state)
    if (address.postal_code) parts.push(address.postal_code)
    if (address.country) parts.push(address.country.toUpperCase())
    
    return parts.join(', ')
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link href="/admin/orders" className="inline-flex items-center space-x-2 text-neutral-600 hover:text-neutral-900">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Orders</span>
          </Link>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-neutral-200 rounded-xl"></div>
              <div className="h-48 bg-neutral-200 rounded-xl"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-neutral-200 rounded-xl"></div>
              <div className="h-32 bg-neutral-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link href="/admin/orders" className="inline-flex items-center space-x-2 text-neutral-600 hover:text-neutral-900">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Orders</span>
          </Link>
        </div>
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-neutral-900 mb-2">Order Not Found</h2>
          <p className="text-neutral-600">The order you're looking for doesn't exist or has been deleted.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/orders" className="inline-flex items-center space-x-2 text-neutral-600 hover:text-neutral-900 mb-4">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Orders</span>
            </Link>
            <h1 className="text-2xl font-bold text-neutral-900">Order #{order.id.substring(0, 8)}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <span className="text-sm text-neutral-500">
                Created {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchOrder}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={deleteOrder}
              disabled={updating}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-neutral-600" />
                <h2 className="text-lg font-medium text-neutral-900">Order Items</h2>
              </div>
            </div>
            <div className="p-6">
              {order.order_items && order.order_items.length > 0 ? (
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-lg">
                      <div className="w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden">
                        {item.products?.image_url ? (
                          <img
                            src={item.products.image_url}
                            alt={item.products.name || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-neutral-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-neutral-900">{item.products?.name || 'Unknown Product'}</h3>
                        <p className="text-sm text-neutral-600">{item.products?.category || 'Uncategorized'}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-neutral-500">Qty: {item.quantity}</span>
                          <div className="text-right">
                            <div className="font-medium text-neutral-900">${(item.price * item.quantity).toFixed(2)}</div>
                            <div className="text-sm text-neutral-500">${item.price.toFixed(2)} each</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  No items found for this order
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-neutral-600" />
                <h2 className="text-lg font-medium text-neutral-900">Customer Information</h2>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-neutral-900 mb-3">Contact Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-700">{order.customer_name || 'Guest Customer'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-700">{order.customer_email || 'No email provided'}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 mb-3">Shipping Address</h3>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-neutral-400 mt-1" />
                  <span className="text-neutral-700">{formatAddress(order.shipping_address)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-neutral-900">Notes</h2>
                <button
                  onClick={() => setEditingNotes(!editingNotes)}
                  className="inline-flex items-center space-x-1 text-amber-600 hover:text-amber-700"
                >
                  <Edit className="h-4 w-4" />
                  <span>{editingNotes ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              {editingNotes ? (
                <div className="space-y-4">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={4}
                    placeholder="Add notes about this order..."
                  />
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={updateNotes}
                      disabled={updating}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                    >
                      Save Notes
                    </button>
                    <button
                      onClick={() => {
                        setNotes(order.notes || '')
                        setEditingNotes(false)
                      }}
                      className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-neutral-700">
                  {order.notes || 'No notes added yet.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-lg font-medium text-neutral-900">Order Summary</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="text-neutral-900 font-medium">${order.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              {order.shipping_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="text-neutral-900 font-medium">${order.shipping_amount.toFixed(2)}</span>
                </div>
              )}
              {order.tax_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tax</span>
                  <span className="text-neutral-900 font-medium">${order.tax_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-medium text-neutral-900">Total</span>
                  <span className="text-lg font-bold text-neutral-900">${order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-lg font-medium text-neutral-900">Status Management</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-neutral-700">Update Status</label>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(e.target.value)}
                  disabled={updating}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-neutral-600" />
                <h2 className="text-lg font-medium text-neutral-900">Payment Details</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-sm text-neutral-500">Payment Method</span>
                <div className="font-medium text-neutral-900 capitalize">{order.payment_method}</div>
              </div>
              {order.stripe_payment_intent_id && (
                <div>
                  <span className="text-sm text-neutral-500">Stripe Payment Intent</span>
                  <div className="font-mono text-sm text-neutral-700 break-all">
                    {order.stripe_payment_intent_id}
                  </div>
                </div>
              )}
              {order.stripe_session_id && (
                <div>
                  <span className="text-sm text-neutral-500">Stripe Session</span>
                  <div className="font-mono text-sm text-neutral-700 break-all">
                    {order.stripe_session_id}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}