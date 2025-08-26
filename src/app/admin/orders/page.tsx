'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Eye, Search, Download, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  total_amount: number
  subtotal: number | null
  tax_amount: number | null  
  shipping_amount: number | null
  status: string
  created_at: string
  customer_name: string | null
  customer_email: string | null
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  payment_method: string | null
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }> | null
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const fetchOrders = useCallback(async () => {
    try {
      const supabase = createClient()
      let query = supabase
        .from('orders')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      if (searchTerm) {
        query = query.or(`customer_name.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching orders:', error)
        setOrders([])
      } else {
        setOrders(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, sortBy, sortOrder])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) {
        console.error('Error updating order status:', error)
        return
      }

      // Update local state
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (error) {
        console.error('Error deleting order:', error)
        return
      }

      // Remove from local state
      setOrders(prev => prev.filter(order => order.id !== orderId))
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const exportOrders = async () => {
    try {
      const csv = [
        ['Order ID', 'Customer Name', 'Email', 'Total Amount', 'Subtotal', 'Tax', 'Shipping', 'Payment Method', 'Status', 'Date'].join(','),
        ...orders.map(order => [
          order.id,
          order.customer_name || 'Guest',
          order.customer_email || 'N/A',
          order.total_amount.toFixed(2),
          (order.subtotal || 0).toFixed(2),
          (order.tax_amount || 0).toFixed(2), 
          (order.shipping_amount || 0).toFixed(2),
          order.payment_method || 'stripe',
          order.status,
          new Date(order.created_at).toLocaleDateString()
        ].join(','))
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting orders:', err)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Orders</h1>
          <p className="text-neutral-600">Manage and track customer orders</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-neutral-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Orders</h1>
        <p className="text-neutral-600">Manage and track customer orders</p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field)
                setSortOrder(order as 'asc' | 'desc')
              }}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="total_amount-desc">Highest Amount</option>
              <option value="total_amount-asc">Lowest Amount</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={exportOrders}
              className="flex items-center space-x-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No Orders Found</h3>
            <p className="text-neutral-600">No orders match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-neutral-900">#{order.id.substring(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-neutral-900">{order.customer_name || 'Guest'}</div>
                        <div className="text-sm text-neutral-500">{order.customer_email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-neutral-900">${order.total_amount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize border-none ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link 
                          href={`/admin/orders/${order.id}`}
                          className="text-amber-600 hover:text-amber-900 p-1"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => deleteOrder(order.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete Order"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination could be added here */}
        {orders.length > 0 && (
          <div className="px-6 py-4 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-500">
                Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}