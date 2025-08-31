'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Dog, Phone, Mail, Search, Download, MessageSquare, User, MapPin, Heart, AlertCircle } from 'lucide-react'
import { formatSingaporeDateForDisplay, formatSingaporeTimeForDisplay, toSingaporeTime, createSingaporeDate } from '@/lib/utils/singapore-timezone'

interface Booking {
  id: string
  user_id: string | null
  booking_token: string | null
  
  // Dog Information
  dog_name: string
  dog_first_name: string | null
  dog_last_name: string | null
  dog_breed: string | null
  dog_age: string | null // Now text, not number
  dog_gender_neuter: string | null
  
  // Owner Information
  owner_name: string | null
  owner_first_name: string | null
  owner_last_name: string | null
  owner_email: string | null
  contact_area_code: string | null
  contact_phone: string | null
  address_street1: string | null
  address_street2: string | null
  address_city: string | null
  address_state: string | null
  address_postal: string | null
  instagram: string | null
  
  // Booking Details
  preferred_date: string
  preferred_time: string | null
  location_type: string | null
  home_visit_fee: number | null
  payment_required: boolean | null
  payment_amount: number | null
  total_paid: number | null
  
  // Assessment Data
  reaction_to_new_people: any | null
  bite_history: string | null
  vaccination_status: string | null
  current_medical_issues: string | null
  food_allergies: string | null
  
  // Status and Metadata
  status: string
  booking_status: string | null
  created_at: string
  updated_at: string | null
  notes: string | null
  terms_accepted: boolean | null
  terms_accepted_at: string | null
  signature_completed: boolean | null
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
        .select(`
          id,
          user_id,
          booking_token,
          dog_name,
          dog_first_name,
          dog_last_name,
          dog_breed,
          dog_age,
          dog_gender_neuter,
          owner_name,
          owner_first_name,
          owner_last_name,
          owner_email,
          contact_area_code,
          contact_phone,
          address_street1,
          address_street2,
          address_city,
          address_state,
          address_postal,
          instagram,
          preferred_date,
          preferred_time,
          location_type,
          home_visit_fee,
          payment_required,
          payment_amount,
          total_paid,
          reaction_to_new_people,
          bite_history,
          vaccination_status,
          current_medical_issues,
          food_allergies,
          status,
          booking_status,
          created_at,
          updated_at,
          notes,
          terms_accepted,
          terms_accepted_at,
          signature_completed
        `)
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      if (searchTerm) {
        query = query.or(`
          dog_name.ilike.%${searchTerm}%,
          owner_first_name.ilike.%${searchTerm}%,
          owner_last_name.ilike.%${searchTerm}%,
          owner_email.ilike.%${searchTerm}%,
          contact_phone.ilike.%${searchTerm}%,
          booking_token.ilike.%${searchTerm}%
        `)
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

  // Get proper contact info from database fields
  const getContactInfo = (booking: Booking) => {
    const name = booking.owner_name || 
      (booking.owner_first_name && booking.owner_last_name ? 
        `${booking.owner_first_name} ${booking.owner_last_name}` : 
        booking.owner_first_name || 'Unknown');
    
    const email = booking.owner_email || 'No email provided';
    
    const phone = booking.contact_phone ? 
      (booking.contact_area_code ? 
        `${booking.contact_area_code}-${booking.contact_phone}` : 
        booking.contact_phone) : 
      'No phone provided';
    
    return { name, email, phone };
  }

  // Get full address
  const getFullAddress = (booking: Booking) => {
    const parts = [
      booking.address_street1,
      booking.address_street2,
      booking.address_city,
      booking.address_state,
      booking.address_postal
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'No address provided';
  }

  const exportBookings = async () => {
    try {
      const csv = [
        ['Booking Token', 'Dog Name', 'Dog Breed', 'Dog Age', 'Owner Name', 'Email', 'Phone', 'Address', 'Preferred Date', 'Preferred Time', 'Location Type', 'Status', 'Booking Status', 'Payment Required', 'Amount Paid', 'Vaccination Status', 'Created'].join(','),
        ...bookings.map(booking => {
          const contact = getContactInfo(booking)
          const address = getFullAddress(booking)
          const sgCreated = toSingaporeTime(new Date(booking.created_at))
          const sgPreferredDate = formatSingaporeDateForDisplay(booking.preferred_date)
          
          return [
            booking.booking_token || booking.id,
            booking.dog_name,
            booking.dog_breed || 'Not specified',
            booking.dog_age || 'Not specified',
            contact.name,
            contact.email,
            contact.phone,
            address,
            sgPreferredDate,
            booking.preferred_time || 'Not specified',
            booking.location_type === 'home' ? 'Home Visit' : 'Park Visit',
            booking.status,
            booking.booking_status || 'N/A',
            booking.payment_required ? 'Yes' : 'No',
            booking.total_paid ? `$${booking.total_paid}` : '$0',
            booking.vaccination_status || 'Not specified',
            sgCreated.toLocaleDateString('en-SG')
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
              const contactInfo = getContactInfo(booking)
              const fullAddress = getFullAddress(booking)
              const sgPreferredDate = toSingaporeTime(new Date(booking.preferred_date + 'T00:00:00'))
              const sgNow = toSingaporeTime(new Date())
              const isUpcoming = sgPreferredDate >= sgNow
              
              return (
                <div key={booking.id} className="p-6 hover:bg-neutral-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-amber-100 p-3 rounded-lg">
                        <Dog className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-neutral-900">
                          {booking.dog_name}
                          {booking.booking_token && (
                            <span className="ml-2 text-sm font-mono text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                              {booking.booking_token}
                            </span>
                          )}
                        </h3>
                        <p className="text-neutral-600">
                          {booking.dog_breed || 'Mixed Breed'} 
                          {booking.dog_age && ` • ${booking.dog_age}`}
                          {booking.dog_gender_neuter && ` • ${booking.dog_gender_neuter}`}
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
                          <span>{formatSingaporeDateForDisplay(booking.preferred_date)}</span>
                          {booking.preferred_time && <span>at {formatSingaporeTimeForDisplay(createSingaporeDate(booking.preferred_date, booking.preferred_time))}</span>}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-neutral-600">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {booking.location_type === 'home' ? 
                              `Home Visit (+$${booking.home_visit_fee || 25})` : 
                              'Clementi Woods Park (Free)'
                            }
                          </span>
                        </div>
                        {booking.payment_required && (
                          <div className="flex items-center space-x-2 text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${
                              booking.total_paid && booking.total_paid > 0 ? 
                                'bg-green-100 text-green-800' : 
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.total_paid && booking.total_paid > 0 ? 
                                `Paid: $${booking.total_paid}` : 
                                `Payment Required: $${booking.payment_amount || 25}`
                              }
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-neutral-500">
                          Requested on {formatSingaporeDateForDisplay(booking.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Health & Assessment Info */}
                    <div>
                      <h4 className="font-medium text-neutral-900 mb-3 flex items-center">
                        <Heart className="h-4 w-4 mr-2 text-red-500" />
                        Health & Assessment
                      </h4>
                      <div className="space-y-2">
                        {booking.vaccination_status && (
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-neutral-600">Vaccinated:</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              booking.vaccination_status === 'Yes' ? 
                                'bg-green-100 text-green-800' : 
                                'bg-red-100 text-red-800'
                            }`}>
                              {booking.vaccination_status}
                            </span>
                          </div>
                        )}
                        {booking.bite_history && (
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-neutral-600">Bite History:</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              booking.bite_history === 'No' ? 
                                'bg-green-100 text-green-800' : 
                                'bg-orange-100 text-orange-800'
                            }`}>
                              {booking.bite_history}
                            </span>
                          </div>
                        )}
                        {booking.current_medical_issues && (
                          <p className="text-xs text-neutral-600 bg-blue-50 p-2 rounded">
                            <span className="font-medium">Medical Issues:</span> {booking.current_medical_issues}
                          </p>
                        )}
                        {booking.food_allergies && (
                          <p className="text-xs text-neutral-600 bg-yellow-50 p-2 rounded">
                            <span className="font-medium">Food Allergies:</span> {booking.food_allergies}
                          </p>
                        )}
                        {booking.reaction_to_new_people && (
                          <p className="text-xs text-neutral-600 bg-purple-50 p-2 rounded">
                            <span className="font-medium">Reaction to New People:</span> {
                              Array.isArray(booking.reaction_to_new_people) ? 
                                booking.reaction_to_new_people.join(', ') : 
                                booking.reaction_to_new_people
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <div>
                        <h4 className="font-medium text-neutral-900 mb-3">Notes</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-neutral-600 bg-neutral-50 p-2 rounded">
                            {booking.notes}
                          </p>
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
                    
                    <button 
                      onClick={() => window.location.href = `/admin/bookings/${booking.id}`}
                      className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors"
                    >
                      View Full Details
                    </button>
                    
                    {booking.signature_completed && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Signed
                      </span>
                    )}
                    
                    {booking.terms_accepted && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Terms Accepted
                      </span>
                    )}
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