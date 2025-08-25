'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Calendar, 
  Users, 
  Target,
  Award,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    thisWeek: number
  }
  orders: {
    total: number
    thisMonth: number
    lastMonth: number
    completed: number
    pending: number
    cancelled: number
  }
  bookings: {
    total: number
    thisMonth: number
    lastMonth: number
    confirmed: number
    pending: number
    completed: number
  }
  customers: {
    total: number
    thisMonth: number
    returning: number
  }
  products: {
    total: number
    lowStock: number
    outOfStock: number
  }
  topProducts: Array<{
    name: string
    sales: number
    revenue: number
  }>
  recentActivity: Array<{
    type: 'order' | 'booking' | 'customer'
    description: string
    timestamp: string
    amount?: number
  }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('30days')

  const fetchAnalytics = useCallback(async () => {
    try {
      const supabase = createClient()
      const now = new Date()
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      const currentWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      // Parallel fetch all data
      const [
        ordersData,
        bookingsData,
        customersData,
        productsData,
        orderItemsData
      ] = await Promise.all([
        // Orders data
        supabase.from('orders').select('*'),
        // Bookings data  
        supabase.from('bookings').select('*'),
        // Customers data
        supabase.from('profiles').select('*'),
        // Products data
        supabase.from('products').select('*'),
        // Order items for product analysis
        supabase.from('order_items').select(`
          quantity,
          price,
          products (name)
        `)
      ])

      const orders = ordersData.data || []
      const bookings = bookingsData.data || []
      const customers = customersData.data || []
      const products = productsData.data || []
      const orderItems = orderItemsData.data || []

      // Calculate revenue metrics
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const thisMonthRevenue = orders
        .filter(order => new Date(order.created_at) >= currentMonth)
        .reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const lastMonthRevenue = orders
        .filter(order => {
          const date = new Date(order.created_at)
          return date >= lastMonth && date <= lastMonthEnd
        })
        .reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const thisWeekRevenue = orders
        .filter(order => new Date(order.created_at) >= currentWeek)
        .reduce((sum, order) => sum + (order.total_amount || 0), 0)

      // Calculate order metrics
      const thisMonthOrders = orders.filter(order => new Date(order.created_at) >= currentMonth).length
      const lastMonthOrders = orders.filter(order => {
        const date = new Date(order.created_at)
        return date >= lastMonth && date <= lastMonthEnd
      }).length

      // Calculate booking metrics
      const thisMonthBookings = bookings.filter(booking => new Date(booking.created_at) >= currentMonth).length
      const lastMonthBookings = bookings.filter(booking => {
        const date = new Date(booking.created_at)
        return date >= lastMonth && date <= lastMonthEnd
      }).length

      // Calculate customer metrics
      const thisMonthCustomers = customers.filter(customer => new Date(customer.created_at) >= currentMonth).length
      
      // Calculate returning customers (those with multiple orders)
      const customerOrderCounts = new Map()
      orders.forEach(order => {
        if (order.customer_email) {
          customerOrderCounts.set(order.customer_email, (customerOrderCounts.get(order.customer_email) || 0) + 1)
        }
      })
      const returningCustomers = Array.from(customerOrderCounts.values()).filter(count => count > 1).length

      // Calculate product metrics
      const lowStockProducts = products.filter(product => product.stock_quantity <= 5 && product.stock_quantity > 0).length
      const outOfStockProducts = products.filter(product => product.stock_quantity === 0).length

      // Calculate top products
      const productSales = new Map()
      orderItems.forEach(item => {
        if (item.products) {
          const existing = productSales.get(item.products.name) || { sales: 0, revenue: 0 }
          productSales.set(item.products.name, {
            sales: existing.sales + item.quantity,
            revenue: existing.revenue + (item.price * item.quantity)
          })
        }
      })

      const topProducts = Array.from(productSales.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5)

      // Generate recent activity
      const recentActivity: AnalyticsData['recentActivity'] = [
        ...orders.slice(-5).map(order => ({
          type: 'order' as const,
          description: `New order from ${order.customer_name || 'Guest'}`,
          timestamp: order.created_at,
          amount: order.total_amount
        })),
        ...bookings.slice(-3).map(booking => ({
          type: 'booking' as const,
          description: `Assessment booking for ${booking.dog_name}`,
          timestamp: booking.created_at
        })),
        ...customers.slice(-2).map(customer => ({
          type: 'customer' as const,
          description: `New customer: ${customer.full_name || 'Unknown'}`,
          timestamp: customer.created_at
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8)

      const analyticsData: AnalyticsData = {
        revenue: {
          total: totalRevenue,
          thisMonth: thisMonthRevenue,
          lastMonth: lastMonthRevenue,
          thisWeek: thisWeekRevenue
        },
        orders: {
          total: orders.length,
          thisMonth: thisMonthOrders,
          lastMonth: lastMonthOrders,
          completed: orders.filter(o => o.status === 'completed').length,
          pending: orders.filter(o => o.status === 'pending').length,
          cancelled: orders.filter(o => o.status === 'cancelled').length
        },
        bookings: {
          total: bookings.length,
          thisMonth: thisMonthBookings,
          lastMonth: lastMonthBookings,
          confirmed: bookings.filter(b => b.status === 'confirmed').length,
          pending: bookings.filter(b => b.status === 'pending').length,
          completed: bookings.filter(b => b.status === 'completed').length
        },
        customers: {
          total: customers.length,
          thisMonth: thisMonthCustomers,
          returning: returningCustomers
        },
        products: {
          total: products.length,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts
        },
        topProducts,
        recentActivity
      }

      setAnalytics(analyticsData)

    } catch (err) {
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const calculatePercentageChange = (current: number, previous: number): { change: number; isPositive: boolean } => {
    if (previous === 0) return { change: current > 0 ? 100 : 0, isPositive: current >= 0 }
    const change = ((current - previous) / previous) * 100
    return { change: Math.abs(change), isPositive: change >= 0 }
  }

  if (loading || !analytics) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Analytics</h1>
          <p className="text-neutral-600">Track your business performance and insights</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-neutral-200 rounded mb-4"></div>
                <div className="h-8 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const revenueChange = calculatePercentageChange(analytics.revenue.thisMonth, analytics.revenue.lastMonth)
  const ordersChange = calculatePercentageChange(analytics.orders.thisMonth, analytics.orders.lastMonth)
  const bookingsChange = calculatePercentageChange(analytics.bookings.thisMonth, analytics.bookings.lastMonth)
  const customersChange = calculatePercentageChange(analytics.customers.thisMonth, analytics.customers.total - analytics.customers.thisMonth)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Analytics</h1>
            <p className="text-neutral-600">Track your business performance and insights</p>
          </div>
          
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Revenue</p>
              <p className="text-2xl font-bold text-neutral-900">${analytics.revenue.thisMonth.toFixed(2)}</p>
              <div className={`flex items-center space-x-1 mt-2 ${revenueChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`h-4 w-4 ${!revenueChange.isPositive && 'rotate-180'}`} />
                <span className="text-sm font-medium">{revenueChange.change.toFixed(1)}%</span>
                <span className="text-xs text-neutral-500">vs last month</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Orders</p>
              <p className="text-2xl font-bold text-neutral-900">{analytics.orders.thisMonth}</p>
              <div className={`flex items-center space-x-1 mt-2 ${ordersChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`h-4 w-4 ${!ordersChange.isPositive && 'rotate-180'}`} />
                <span className="text-sm font-medium">{ordersChange.change.toFixed(1)}%</span>
                <span className="text-xs text-neutral-500">vs last month</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Bookings</p>
              <p className="text-2xl font-bold text-neutral-900">{analytics.bookings.thisMonth}</p>
              <div className={`flex items-center space-x-1 mt-2 ${bookingsChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`h-4 w-4 ${!bookingsChange.isPositive && 'rotate-180'}`} />
                <span className="text-sm font-medium">{bookingsChange.change.toFixed(1)}%</span>
                <span className="text-xs text-neutral-500">vs last month</span>
              </div>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">New Customers</p>
              <p className="text-2xl font-bold text-neutral-900">{analytics.customers.thisMonth}</p>
              <div className={`flex items-center space-x-1 mt-2 ${customersChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`h-4 w-4 ${!customersChange.isPositive && 'rotate-180'}`} />
                <span className="text-sm font-medium">{customersChange.change.toFixed(1)}%</span>
                <span className="text-xs text-neutral-500">growth</span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="font-semibold text-lg text-neutral-900 mb-4 flex items-center">
            <Target className="h-5 w-5 text-amber-600 mr-2" />
            Order Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Completed</span>
              <span className="font-medium text-green-600">{analytics.orders.completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Pending</span>
              <span className="font-medium text-yellow-600">{analytics.orders.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Cancelled</span>
              <span className="font-medium text-red-600">{analytics.orders.cancelled}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="font-semibold text-lg text-neutral-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 text-amber-600 mr-2" />
            Booking Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Completed</span>
              <span className="font-medium text-blue-600">{analytics.bookings.completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Confirmed</span>
              <span className="font-medium text-green-600">{analytics.bookings.confirmed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Pending</span>
              <span className="font-medium text-yellow-600">{analytics.bookings.pending}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="font-semibold text-lg text-neutral-900 mb-4 flex items-center">
            <Award className="h-5 w-5 text-amber-600 mr-2" />
            Customer Insights
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Total Customers</span>
              <span className="font-medium">{analytics.customers.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Returning</span>
              <span className="font-medium text-green-600">{analytics.customers.returning}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Retention Rate</span>
              <span className="font-medium text-blue-600">
                {analytics.customers.total > 0 ? ((analytics.customers.returning / analytics.customers.total) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Additional Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="font-semibold text-lg text-neutral-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 text-amber-600 mr-2" />
            Top Products
          </h3>
          <div className="space-y-4">
            {analytics.topProducts.length > 0 ? analytics.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900">{product.name}</p>
                  <p className="text-sm text-neutral-500">{product.sales} sold</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-neutral-900">${product.revenue.toFixed(2)}</p>
                </div>
              </div>
            )) : (
              <p className="text-neutral-500">No product data available</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="font-semibold text-lg text-neutral-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 text-amber-600 mr-2" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'order' ? 'bg-green-100' :
                  activity.type === 'booking' ? 'bg-blue-100' :
                  'bg-purple-100'
                }`}>
                  {activity.type === 'order' ? (
                    <ShoppingBag className={`h-4 w-4 ${
                      activity.type === 'order' ? 'text-green-600' :
                      activity.type === 'booking' ? 'text-blue-600' :
                      'text-purple-600'
                    }`} />
                  ) : activity.type === 'booking' ? (
                    <Calendar className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Users className="h-4 w-4 text-purple-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-900">{activity.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                    {activity.amount && (
                      <p className="text-xs font-medium text-green-600">
                        ${activity.amount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Alert */}
      {(analytics.products.lowStock > 0 || analytics.products.outOfStock > 0) && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-semibold text-lg text-amber-900 mb-4">Inventory Alerts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.products.lowStock > 0 && (
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-yellow-900">{analytics.products.lowStock} products low in stock</p>
                  <p className="text-sm text-yellow-700">Items with 5 or fewer remaining</p>
                </div>
              </div>
            )}
            
            {analytics.products.outOfStock > 0 && (
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-900">{analytics.products.outOfStock} products out of stock</p>
                  <p className="text-sm text-red-700">Items that need restocking</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}