'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Phone, Calendar, ShoppingBag, Dog, Search, Filter, Download, MoreHorizontal } from 'lucide-react'

interface Customer {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

interface CustomerStats {
  totalOrders: number
  totalSpent: number
  totalBookings: number
  lastOrderDate: string | null
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerStats, setCustomerStats] = useState<Map<string, CustomerStats>>(new Map())
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const fetchCustomers = useCallback(async () => {
    try {
      const supabase = createClient()
      
      // Fetch customers (profiles)
      let query = supabase
        .from('profiles')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' })

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      }

      const { data: customersData, error: customersError } = await query

      if (customersError) {
        console.error('Error fetching customers:', customersError)
        setCustomers([])
        return
      }

      setCustomers(customersData || [])

      // Fetch stats for each customer
      const statsMap = new Map<string, CustomerStats>()
      
      if (customersData && customersData.length > 0) {
        // Get all orders for these customers
        const { data: orders } = await supabase
          .from('orders')
          .select('user_id, total_amount, created_at, customer_email')
          .in('customer_email', customersData.map(c => c.email).filter(Boolean))

        // Get all bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select('notes')

        // Process stats for each customer
        for (const customer of customersData) {
          const customerOrders = orders?.filter(order => 
            order.customer_email === customer.email
          ) || []

          // Extract customer bookings from notes (since bookings are anonymous)
          const customerBookings = bookings?.filter(booking => {
            if (!booking.notes || !customer.email) return false
            return booking.notes.includes(customer.email)
          }) || []

          const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
          const lastOrder = customerOrders.length > 0 
            ? customerOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
            : null

          statsMap.set(customer.id, {
            totalOrders: customerOrders.length,
            totalSpent,
            totalBookings: customerBookings.length,
            lastOrderDate: lastOrder?.created_at || null
          })
        }
      }

      setCustomerStats(statsMap)

    } catch (err) {
      console.error('Error:', err)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, sortBy, sortOrder])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const deleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', customerId)

      if (error) {
        console.error('Error deleting customer:', error)
        return
      }

      // Update local state
      setCustomers(prev => prev.filter(customer => customer.id !== customerId))
      setCustomerStats(prev => {
        const newMap = new Map(prev)
        newMap.delete(customerId)
        return newMap
      })
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const exportCustomers = async () => {
    try {
      const csv = [
        ['Customer ID', 'Name', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'Total Bookings', 'Join Date', 'Last Order'].join(','),
        ...customers.map(customer => {
          const stats = customerStats.get(customer.id) || { totalOrders: 0, totalSpent: 0, totalBookings: 0, lastOrderDate: null }
          return [
            customer.id,
            customer.full_name || 'N/A',
            customer.email || 'N/A',
            customer.phone || 'N/A',
            stats.totalOrders,
            stats.totalSpent.toFixed(2),
            stats.totalBookings,
            new Date(customer.created_at).toLocaleDateString(),
            stats.lastOrderDate ? new Date(stats.lastOrderDate).toLocaleDateString() : 'Never'
          ].join(',')
        })
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting customers:', err)
    }
  }

  const getCustomerTier = (stats: CustomerStats) => {
    if (stats.totalSpent >= 500) return { tier: 'VIP', color: 'bg-purple-100 text-purple-800' }
    if (stats.totalSpent >= 200) return { tier: 'Gold', color: 'bg-yellow-100 text-yellow-800' }
    if (stats.totalSpent >= 50) return { tier: 'Silver', color: 'bg-gray-100 text-gray-800' }
    return { tier: 'Bronze', color: 'bg-amber-100 text-amber-800' }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Customers</h1>
          <p className="text-neutral-600">Manage your customer relationships</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-neutral-200 rounded"></div>
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
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Customers</h1>
        <p className="text-neutral-600">Manage your customer relationships and track engagement</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Total Customers</p>
              <p className="text-2xl font-bold text-neutral-900">{customers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Total Orders</p>
              <p className="text-2xl font-bold text-neutral-900">
                {Array.from(customerStats.values()).reduce((sum, stats) => sum + stats.totalOrders, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-100 p-3 rounded-lg">
              <Dog className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Total Bookings</p>
              <p className="text-2xl font-bold text-neutral-900">
                {Array.from(customerStats.values()).reduce((sum, stats) => sum + stats.totalBookings, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Avg. Customer Value</p>
              <p className="text-2xl font-bold text-neutral-900">
                ${customers.length > 0 
                  ? (Array.from(customerStats.values()).reduce((sum, stats) => sum + stats.totalSpent, 0) / customers.length).toFixed(0)
                  : '0'
                }
              </p>
            </div>
          </div>
        </div>
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
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

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
              <option value="full_name-asc">Name A-Z</option>
              <option value="full_name-desc">Name Z-A</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={exportCustomers}
              className="flex items-center space-x-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        {customers.length === 0 ? (
          <div className="p-12 text-center">
            <User className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No Customers Found</h3>
            <p className="text-neutral-600">No customers match your current search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {customers.map((customer) => {
                  const stats = customerStats.get(customer.id) || { totalOrders: 0, totalSpent: 0, totalBookings: 0, lastOrderDate: null }
                  const tier = getCustomerTier(stats)
                  
                  return (
                    <tr key={customer.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-neutral-100 p-2 rounded-full mr-4">
                            <User className="h-5 w-5 text-neutral-600" />
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900">{customer.full_name || 'N/A'}</div>
                            <div className="text-sm text-neutral-500">ID: {customer.id.substring(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="flex items-center space-x-2 text-sm text-neutral-600">
                              <Mail className="h-3 w-3" />
                              <span>{customer.email}</span>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center space-x-2 text-sm text-neutral-600">
                              <Phone className="h-3 w-3" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">
                          <div className="font-medium">{stats.totalOrders} orders</div>
                          <div className="text-neutral-500">{stats.totalBookings} bookings</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-neutral-900">${stats.totalSpent.toFixed(2)}</div>
                        {stats.lastOrderDate && (
                          <div className="text-xs text-neutral-500">
                            Last: {new Date(stats.lastOrderDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${tier.color}`}>
                          {tier.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-amber-600 hover:text-amber-900">
                            View
                          </button>
                          <button 
                            onClick={() => deleteCustomer(customer.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                          <button className="text-neutral-400 hover:text-neutral-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {customers.length > 0 && (
          <div className="px-6 py-4 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-500">
                Showing {customers.length} customer{customers.length !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-neutral-400">
                Active customers with orders: {Array.from(customerStats.values()).filter(s => s.totalOrders > 0).length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}