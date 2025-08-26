'use client'

import { Bell, Search, Menu, AlertTriangle, Package, ShoppingBag, Calendar, TrendingUp, FileText, User } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePathname, useRouter } from 'next/navigation'

interface Notification {
  id: string
  type: 'booking' | 'order' | 'stock' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

interface QuickStats {
  todaysOrders: number
  todaysRevenue: number
  pendingBookings: number
  lowStockItems: number
}

export default function AdminHeader() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [quickStats, setQuickStats] = useState<QuickStats>({
    todaysOrders: 0,
    todaysRevenue: 0,
    pendingBookings: 0,
    lowStockItems: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    type: 'order' | 'customer' | 'product' | 'booking';
    title: string;
    subtitle?: string;
    href: string;
  }>>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const fetchQuickStats = useCallback(async () => {
    try {
      const supabase = createClient()
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayISO = today.toISOString()

      // Parallel fetch for better performance
      const [ordersData, bookingsData, productsData] = await Promise.all([
        // Today's orders
        supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', todayISO),
        
        // Pending bookings
        supabase
          .from('bookings')
          .select('id')
          .eq('status', 'pending'),
        
        // Low stock products
        supabase
          .from('products')
          .select('id')
          .lte('stock_quantity', 5)
          .eq('is_active', true)
      ])

      const todaysOrders = ordersData.data?.length || 0
      const todaysRevenue = ordersData.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      const pendingBookings = bookingsData.data?.length || 0
      const lowStockItems = productsData.data?.length || 0

      setQuickStats({
        todaysOrders,
        todaysRevenue,
        pendingBookings,
        lowStockItems
      })

    } catch (err) {
      console.error('Error fetching quick stats:', err)
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    try {
      const supabase = createClient()
      
      // Generate notifications based on recent activity
      const realNotifications: Notification[] = []

      // Check for recent bookings
      const { data: recentBookings } = await supabase
        .from('bookings')
        .select('dog_name, created_at, status, notes')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(3)

      recentBookings?.forEach((booking, index) => {
        const contactInfo = extractContactInfo(booking.notes)
        realNotifications.push({
          id: `booking-${booking.dog_name}-${index}`,
          type: 'booking',
          title: 'New booking request',
          message: `${contactInfo.name} requested assessment for ${booking.dog_name}`,
          timestamp: booking.created_at,
          read: false,
          actionUrl: '/admin/bookings'
        })
      })

      // Check for recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, customer_name, total_amount, created_at')
        .order('created_at', { ascending: false })
        .limit(2)

      recentOrders?.forEach((order, index) => {
        realNotifications.push({
          id: `order-${order.id}-${index}`,
          type: 'order',
          title: 'New order received',
          message: `Order from ${order.customer_name || 'Guest'} - $${order.total_amount.toFixed(2)}`,
          timestamp: order.created_at,
          read: false,
          actionUrl: '/admin/orders'
        })
      })

      // Check for low stock
      const { data: lowStockProducts } = await supabase
        .from('products')
        .select('name, stock_quantity')
        .lte('stock_quantity', 5)
        .eq('is_active', true)
        .limit(2)

      lowStockProducts?.forEach((product, index) => {
        realNotifications.push({
          id: `stock-${product.name}-${index}`,
          type: 'stock',
          title: 'Low stock alert',
          message: `${product.name} has ${product.stock_quantity} units left`,
          timestamp: new Date().toISOString(),
          read: false,
          actionUrl: '/admin/products'
        })
      })

      // Sort by timestamp (newest first)
      realNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      setNotifications(realNotifications.slice(0, 5)) // Limit to 5 most recent

    } catch (err) {
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuickStats()
    fetchNotifications()
  }, [fetchQuickStats, fetchNotifications])

  // Extract contact info from booking notes
  const extractContactInfo = (notes: string | null) => {
    if (!notes) return { name: 'Unknown' }
    const nameMatch = notes.match(/Contact:\s*([^,]+)/)
    return { name: nameMatch?.[1]?.trim() || 'Unknown' }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-4 w-4 text-blue-600" />
      case 'order':
        return <ShoppingBag className="h-4 w-4 text-green-600" />
      case 'stock':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Bell className="h-4 w-4 text-neutral-600" />
    }
  }

  const getSearchIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="h-4 w-4 text-green-600" />
      case 'booking':
        return <Calendar className="h-4 w-4 text-blue-600" />
      case 'product':
        return <Package className="h-4 w-4 text-purple-600" />
      default:
        return <FileText className="h-4 w-4 text-neutral-600" />
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date().getTime()
    const time = new Date(timestamp).getTime()
    const diff = now - time
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const handleNotificationClick = (notification: Notification) => {
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
      setShowNotifications(false)
    }
  }

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setSearchLoading(true)
    try {
      const supabase = createClient()
      const searchQuery = query.toLowerCase().trim()

      // Search orders by customer name or order ID
      const { data: orders } = await supabase
        .from('orders')
        .select('id, customer_name, customer_email, total_amount, status, created_at')
        .or(`customer_name.ilike.%${searchQuery}%,customer_email.ilike.%${searchQuery}%,id.eq.${query}`)
        .limit(5)

      // Search bookings by dog name or notes
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, dog_name, notes, status, created_at')
        .or(`dog_name.ilike.%${searchQuery}%,notes.ilike.%${searchQuery}%`)
        .limit(5)

      // Search products by name or category
      const { data: products } = await supabase
        .from('products')
        .select('id, name, category, price, stock_quantity')
        .or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
        .limit(5)

      const results = [
        ...(orders || []).map(order => ({
          id: order.id,
          type: 'order' as const,
          title: `Order #${order.id}`,
          subtitle: `${order.customer_name || 'Guest'} - $${order.total_amount?.toFixed(2)}`,
          href: `/admin/orders/${order.id}`
        })),
        ...(bookings || []).map(booking => ({
          id: booking.id,
          type: 'booking' as const,
          title: `Booking - ${booking.dog_name}`,
          subtitle: extractContactInfo(booking.notes).name,
          href: `/admin/bookings`
        })),
        ...(products || []).map(product => ({
          id: product.id,
          type: 'product' as const,
          title: product.name,
          subtitle: `${product.category} - $${product.price} (${product.stock_quantity} in stock)`,
          href: `/admin/products/${product.id}`
        }))
      ]

      setSearchResults(results)
      setShowSearchResults(results.length > 0)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setSearchLoading(false)
    }
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    performSearch(value)
  }

  const handleSearchResultClick = (result: {
    id: string;
    type: 'order' | 'customer' | 'product' | 'booking';
    title: string;
    subtitle?: string;
    href: string;
  }) => {
    router.push(result.href)
    setShowSearchResults(false)
    setSearchTerm('')
  }

  const unreadCount = notifications.filter(n => !n.read).length

  // Get page title from pathname
  const getPageTitle = () => {
    switch (pathname) {
      case '/admin':
        return 'Dashboard'
      case '/admin/products':
        return 'Products'
      case '/admin/orders':
        return 'Orders'
      case '/admin/bookings':
        return 'Bookings'
      case '/admin/customers':
        return 'Customers'
      case '/admin/analytics':
        return 'Analytics'
      case '/admin/settings':
        return 'Settings'
      default:
        return 'Admin Panel'
    }
  }

  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-4 w-full">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <button className="lg:hidden">
              <Menu className="h-6 w-6 text-neutral-600" />
            </button>
            
            {/* Page Title */}
            <div className="hidden sm:block">
              <h1 className="text-xl font-semibold text-neutral-900">{getPageTitle()}</h1>
            </div>
          </div>
          
          {/* Global Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 z-10" />
            <input
              type="text"
              placeholder="Search orders, bookings, products..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => searchTerm.length >= 2 && setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent w-80"
            />
            
            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-12 left-0 right-0 bg-white rounded-lg shadow-lg border border-neutral-200 z-50 max-h-96 overflow-y-auto">
                {searchLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-sm text-neutral-500 mt-2">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="p-3 border-b border-neutral-100 bg-neutral-50">
                      <p className="text-xs font-medium text-neutral-600">Search Results ({searchResults.length})</p>
                    </div>
                    {searchResults.map((result, index) => (
                      <div
                        key={`${result.type}-${result.id}-${index}`}
                        onClick={() => handleSearchResultClick(result)}
                        className="p-3 hover:bg-neutral-50 border-b border-neutral-100 cursor-pointer transition-colors last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {getSearchIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">{result.title}</p>
                            <p className="text-xs text-neutral-600 truncate">{result.subtitle}</p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              result.type === 'order' ? 'bg-green-100 text-green-700' :
                              result.type === 'booking' ? 'bg-blue-100 text-blue-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {result.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : searchTerm.length >= 2 ? (
                  <div className="p-4 text-center text-neutral-500">
                    <Search className="h-6 w-6 text-neutral-300 mx-auto mb-2" />
                    <p className="text-sm">No results found for &ldquo;{searchTerm}&rdquo;</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-6">
          {/* Quick Stats */}
          <div className="hidden xl:flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
              <ShoppingBag className="h-4 w-4 text-green-600" />
              <div className="text-center">
                <p className="text-green-700 font-medium">{quickStats.todaysOrders}</p>
                <p className="text-green-600 text-xs">Today&apos;s Orders</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div className="text-center">
                <p className="text-blue-700 font-medium">${quickStats.todaysRevenue.toFixed(0)}</p>
                <p className="text-blue-600 text-xs">Today&apos;s Revenue</p>
              </div>
            </div>

            {quickStats.pendingBookings > 0 && (
              <div className="flex items-center space-x-2 bg-amber-50 px-3 py-2 rounded-lg">
                <Calendar className="h-4 w-4 text-amber-600" />
                <div className="text-center">
                  <p className="text-amber-700 font-medium">{quickStats.pendingBookings}</p>
                  <p className="text-amber-600 text-xs">Pending</p>
                </div>
              </div>
            )}

            {quickStats.lowStockItems > 0 && (
              <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
                <Package className="h-4 w-4 text-red-600" />
                <div className="text-center">
                  <p className="text-red-700 font-medium">{quickStats.lowStockItems}</p>
                  <p className="text-red-600 text-xs">Low Stock</p>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
                <div className="p-4 border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-neutral-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="animate-pulse space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-16 bg-neutral-200 rounded"></div>
                        ))}
                      </div>
                    </div>
                  ) : notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className="p-4 hover:bg-neutral-50 border-b border-neutral-100 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900">{notification.title}</p>
                            <p className="text-xs text-neutral-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-neutral-400 mt-2">{getTimeAgo(notification.timestamp)}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-neutral-500">
                      <Bell className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                      <p>No new notifications</p>
                    </div>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-4 border-t border-neutral-200">
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-amber-600 text-sm font-medium hover:text-amber-700 w-full text-center"
                    >
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}