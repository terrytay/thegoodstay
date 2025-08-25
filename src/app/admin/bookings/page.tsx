'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Dog, Phone, Mail, Search, Filter, Download, MessageSquare } from 'lucide-react'

interface Booking {
  id: string
  dog_name: string
  dog_breed: string | null
  dog_age: number | null
  preferred_date: string
  preferred_time: string | null
  status: string
  created_at: string
  notes: string | null
  special_requirements: string | null
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  const fetchBookings = useCallback(async () => {
    try {
      const supabase = createClient()
      let query = supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      if (searchTerm) {
        query = query.or(`dog_name.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)
      }

      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0]
        query = query.eq('preferred_date', today)
      } else if (dateFilter === 'upcoming') {
        const today = new Date().toISOString().split('T')[0]
        query = query.gte('preferred_date', today)
      } else if (dateFilter === 'past') {
        const today = new Date().toISOString().split('T')[0]
        query = query.lt('preferred_date', today)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching bookings:', error)
        setBookings([])
      } else {
        setBookings(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, dateFilter])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)

      if (error) {
        console.error('Error updating booking status:', error)
        return
      }

      // Update local state
      setBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      )
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  // Extract contact info from notes field
  const extractContactInfo = (notes: string | null) => {
    if (!notes) return { name: 'Unknown', email: 'N/A', phone: 'N/A' }
    
    const emailMatch = notes.match(/Email:\s*([^\s,]+)/)
    const phoneMatch = notes.match(/Phone:\s*([^\s,]+)/)
    const nameMatch = notes.match(/Contact:\s*([^,]+)/)
    
    return {
      name: nameMatch?.[1]?.trim() || 'Unknown',
      email: emailMatch?.[1]?.trim() || 'N/A',
      phone: phoneMatch?.[1]?.trim() || 'N/A'
    }
  }

  const exportBookings = async () => {
    try {
      const csv = [
        ['Booking ID', 'Dog Name', 'Owner Name', 'Email', 'Phone', 'Preferred Date', 'Status', 'Created'].join(','),
        ...bookings.map(booking => {
          const contact = extractContactInfo(booking.notes)
          return [
            booking.id,
            booking.dog_name,
            contact.name,
            contact.email,
            contact.phone,
            booking.preferred_date,
            booking.status,
            new Date(booking.created_at).toLocaleDateString()
          ].join(',')
        })
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting bookings:', err)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Assessment Bookings</h1>
          <p className="text-neutral-600">Manage assessment visit requests</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-neutral-200 rounded"></div>
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
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Assessment Bookings</h1>
        <p className="text-neutral-600">Manage assessment visit requests from potential clients</p>
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
                placeholder="Search bookings..."
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
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={exportBookings}
              className="flex items-center space-x-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        {bookings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No Bookings Found</h3>
            <p className="text-neutral-600">No assessment bookings match your current filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {bookings.map((booking) => {
              const contactInfo = extractContactInfo(booking.notes)
              const isUpcoming = new Date(booking.preferred_date) >= new Date()
              
              return (
                <div key={booking.id} className="p-6 hover:bg-neutral-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-amber-100 p-3 rounded-lg">
                        <Dog className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-neutral-900">{booking.dog_name}</h3>
                        <p className="text-neutral-600">
                          {booking.dog_breed || 'Mixed Breed'} 
                          {booking.dog_age && ` • ${booking.dog_age} years old`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <select
                        value={booking.status}
                        onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                        className={`inline-flex px-3 py-1 text-sm font-medium rounded-full capitalize border-none ${getStatusColor(booking.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      
                      {isUpcoming && booking.status === 'pending' && (
                        <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Contact Information */}
                    <div>
                      <h4 className="font-medium text-neutral-900 mb-3">Owner Information</h4>
                      <div className="space-y-2">
                        <p className="text-neutral-700 font-medium">{contactInfo.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-neutral-600">
                          <Mail className="h-4 w-4" />
                          <span>{contactInfo.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-neutral-600">
                          <Phone className="h-4 w-4" />
                          <span>{contactInfo.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div>
                      <h4 className="font-medium text-neutral-900 mb-3">Appointment Details</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-neutral-600">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(booking.preferred_date).toLocaleDateString()}</span>
                          {booking.preferred_time && <span>at {booking.preferred_time}</span>}
                        </div>
                        <p className="text-xs text-neutral-500">
                          Requested on {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Special Requirements */}
                    {(booking.special_requirements || booking.notes) && (
                      <div>
                        <h4 className="font-medium text-neutral-900 mb-3">Notes</h4>
                        <div className="space-y-2">
                          {booking.special_requirements && (
                            <p className="text-sm text-neutral-600 bg-neutral-50 p-2 rounded">
                              {booking.special_requirements}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Confirm Booking
                        </button>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>Contact Owner</span>
                        </button>
                      </>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                    
                    <button className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        {bookings.length > 0 && (
          <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-500">
                Showing {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-neutral-400">
                Total pending: {bookings.filter(b => b.status === 'pending').length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}