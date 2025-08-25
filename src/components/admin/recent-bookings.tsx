'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Dog, Phone, Mail } from 'lucide-react'

interface Booking {
  id: string
  dog_name: string
  dog_breed: string | null
  preferred_date: string
  preferred_time: string | null
  status: string
  created_at: string
  notes: string | null
}

export default function RecentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecentBookings = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

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
  }, [])

  useEffect(() => {
    fetchRecentBookings()
  }, [fetchRecentBookings])

  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) {
        console.error('Error updating booking:', error)
        return
      }

      // Update local state
      setBookings(prev =>
        prev.map(booking =>
          booking.id === id ? { ...booking, status: newStatus } : booking
        )
      )
    } catch (err) {
      console.error('Error:', err)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-neutral-100 text-neutral-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Recent Assessment Bookings</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Recent Assessment Bookings</h2>
        </div>
        <div className="p-12 text-center">
          <p className="text-neutral-600">No bookings yet. Assessment requests will appear here once customers book visits.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
      <div className="px-6 py-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Recent Assessment Bookings</h2>
          <Link
            href="/admin/bookings"
            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            View all
          </Link>
        </div>
      </div>

      <div className="divide-y divide-neutral-200">
        {bookings.map((booking) => {
          const contactInfo = extractContactInfo(booking.notes)
          return (
            <div key={booking.id} className="p-6 hover:bg-neutral-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Dog className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900">{booking.dog_name}</h3>
                      <p className="text-sm text-neutral-500">{booking.dog_breed || 'Mixed Breed'}</p>
                    </div>
                    <div className="ml-auto">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-2">Owner Information</h4>
                      <p className="text-sm text-neutral-900 mb-1">{contactInfo.name}</p>
                      <div className="flex items-center space-x-2 text-sm text-neutral-600 mb-1">
                        <Mail className="h-3 w-3" />
                        <span>{contactInfo.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-neutral-600">
                        <Phone className="h-3 w-3" />
                        <span>{contactInfo.phone}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-2">Appointment Details</h4>
                      <div className="flex items-center space-x-2 text-sm text-neutral-600 mb-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(booking.preferred_date).toLocaleDateString()}</span>
                        {booking.preferred_time && <span>at {booking.preferred_time}</span>}
                      </div>
                      <p className="text-xs text-neutral-500">
                        Requested on {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-3">
                    {booking.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Confirm
                        </button>
                        <button className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors">
                          Contact
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
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}