'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, TrendingDown, ShoppingBag, Calendar, Users, DollarSign } from 'lucide-react'

interface DashboardStats {
  totalRevenue: number
  previousRevenue: number
  totalOrders: number
  previousOrders: number
  totalBookings: number
  previousBookings: number
  totalCustomers: number
  previousCustomers: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    previousRevenue: 0,
    totalOrders: 0,
    previousOrders: 0,
    totalBookings: 0,
    previousBookings: 0,
    totalCustomers: 0,
    previousCustomers: 0
  })
  const [loading, setLoading] = useState(true)

  const fetchDashboardStats = useCallback(async () => {
    try {
      const supabase = createClient()
      const now = new Date()
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

      // Current month stats
      const [
        currentOrders,
        currentBookings,
        currentProfiles,
        previousOrders,
        previousBookings,
        previousProfiles
      ] = await Promise.all([
        // Current month orders
        supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', currentMonth.toISOString()),
        
        // Current month bookings
        supabase
          .from('bookings')
          .select('id')
          .gte('created_at', currentMonth.toISOString()),
        
        // Current month profiles (customers)
        supabase
          .from('profiles')
          .select('id')
          .gte('created_at', currentMonth.toISOString()),
        
        // Previous month orders
        supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', previousMonth.toISOString())
          .lte('created_at', previousMonthEnd.toISOString()),
        
        // Previous month bookings
        supabase
          .from('bookings')
          .select('id')
          .gte('created_at', previousMonth.toISOString())
          .lte('created_at', previousMonthEnd.toISOString()),
        
        // Previous month profiles
        supabase
          .from('profiles')
          .select('id')
          .gte('created_at', previousMonth.toISOString())
          .lte('created_at', previousMonthEnd.toISOString())
      ])

      const totalRevenue = currentOrders.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      const previousRevenue = previousOrders.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      
      setStats({
        totalRevenue,
        previousRevenue,
        totalOrders: currentOrders.data?.length || 0,
        previousOrders: previousOrders.data?.length || 0,
        totalBookings: currentBookings.data?.length || 0,
        previousBookings: previousBookings.data?.length || 0,
        totalCustomers: currentProfiles.data?.length || 0,
        previousCustomers: previousProfiles.data?.length || 0
      })

    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardStats()
  }, [fetchDashboardStats])

  const calculateChange = (current: number, previous: number): { change: string; changeType: 'increase' | 'decrease' | 'neutral' } => {
    if (previous === 0) {
      return { change: current > 0 ? '+100%' : '0%', changeType: current > 0 ? 'increase' : 'neutral' }
    }
    
    const percentage = ((current - previous) / previous) * 100
    const changeType = percentage > 0 ? 'increase' : percentage < 0 ? 'decrease' : 'neutral'
    const change = percentage > 0 ? `+${percentage.toFixed(1)}%` : `${percentage.toFixed(1)}%`
    
    return { change, changeType }
  }

  const revenueChange = calculateChange(stats.totalRevenue, stats.previousRevenue)
  const ordersChange = calculateChange(stats.totalOrders, stats.previousOrders)
  const bookingsChange = calculateChange(stats.totalBookings, stats.previousBookings)
  const customersChange = calculateChange(stats.totalCustomers, stats.previousCustomers)

  const dashboardStats = [
    {
      name: 'Total Revenue',
      value: loading ? '...' : `$${stats.totalRevenue.toFixed(2)}`,
      change: revenueChange.change,
      changeType: revenueChange.changeType,
      icon: DollarSign,
      period: 'this month'
    },
    {
      name: 'Orders',
      value: loading ? '...' : stats.totalOrders.toString(),
      change: ordersChange.change,
      changeType: ordersChange.changeType,
      icon: ShoppingBag,
      period: 'this month'
    },
    {
      name: 'Bookings',
      value: loading ? '...' : stats.totalBookings.toString(),
      change: bookingsChange.change,
      changeType: bookingsChange.changeType,
      icon: Calendar,
      period: 'this month'
    },
    {
      name: 'Customers',
      value: loading ? '...' : stats.totalCustomers.toString(),
      change: customersChange.change,
      changeType: customersChange.changeType,
      icon: Users,
      period: 'this month'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {dashboardStats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">{stat.name}</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">{stat.value}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <Icon className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            
            <div className="mt-4 flex items-center">
              <div className={`flex items-center space-x-1 ${
                stat.changeType === 'increase' ? 'text-green-600' : 
                stat.changeType === 'decrease' ? 'text-red-600' : 'text-neutral-600'
              }`}>
                {stat.changeType === 'increase' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : stat.changeType === 'decrease' ? (
                  <TrendingDown className="h-4 w-4" />
                ) : (
                  <div className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{stat.change}</span>
              </div>
              <span className="text-neutral-600 text-sm ml-2">{stat.period}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}