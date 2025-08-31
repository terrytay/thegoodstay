'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, 
  Dog, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Heart, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  Download, 
  Send,
  Edit,
  Trash2,
  DollarSign,
  FileText,
  Signature,
  MailCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { formatSingaporeDateForDisplay, formatSingaporeTimeForDisplay, toSingaporeTime, createSingaporeDate } from '@/lib/utils/singapore-timezone'

interface DetailedBooking {
  id: string
  user_id: string | null
  booking_token: string | null
  
  // Dog Information
  dog_name: string
  dog_first_name: string | null
  dog_last_name: string | null
  dog_breed: string | null
  dog_age: string | null
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
  uncomfortable_situations: string | null
  reactivity_details: string | null
  bite_history: string | null
  sensitive_body_areas: string | null
  aggression_details: string | null
  bite_severity: string | null
  anxiety_new_environments: string | null
  thunderstorm_response: string | null
  behavior_when_alone: string | null
  current_medical_issues: string | null
  food_allergies: string | null
  vaccination_status: string | null
  
  // Status and Metadata
  status: string
  booking_status: string | null
  created_at: string
  updated_at: string | null
  notes: string | null
  terms_accepted: boolean | null
  terms_accepted_at: string | null
  signature_completed: boolean | null
  signature_data: string | null
  
  // Email Tracking (from previous session enhancements)
  confirmation_email_sent: boolean | null
  confirmation_email_sent_at: string | null
  email_send_attempts: number | null
  last_email_error: string | null
  
  // Calendar Integration
  calendar_event_id: string | null
}

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string
  
  const [booking, setBooking] = useState<DetailedBooking | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails()
    }
  }, [bookingId])

  const fetchBookingDetails = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single()

      if (error) {
        console.error('Error fetching booking:', error)
        return
      }

      setBooking(data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (newStatus: string, field: 'status' | 'booking_status' = 'status') => {
    if (!booking) return
    
    setUpdating(true)
    try {
      const supabase = createClient()
      const updateData: any = { [field]: newStatus }
      
      // If confirming via status field, also update booking_status
      if (field === 'status' && newStatus === 'confirmed') {
        updateData.booking_status = 'confirmed'
      }
      
      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)

      if (error) {
        console.error('Error updating booking:', error)
        return
      }

      // Handle calendar events based on status change
      if (newStatus === 'confirmed') {
        // Create calendar event for confirmed bookings
        try {
          await fetch('/api/calendar/create-booking-event', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bookingId }),
          })
        } catch (calendarError) {
          console.error('Failed to create calendar event:', calendarError)
          // Don't fail the booking confirmation if calendar event fails
        }
      } else if (newStatus === 'cancelled') {
        // Delete calendar event for cancelled bookings
        try {
          await fetch('/api/calendar/delete-booking-event', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bookingId }),
          })
        } catch (calendarError) {
          console.error('Failed to delete calendar event:', calendarError)
          // Don't fail the booking cancellation if calendar event deletion fails
        }
      }

      setBooking(prev => prev ? { ...prev, ...updateData } : null)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getFullAddress = () => {
    if (!booking) return 'No address provided'
    const parts = [
      booking.address_street1,
      booking.address_street2,
      booking.address_city,
      booking.address_state,
      booking.address_postal
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'No address provided'
  }

  const getOwnerName = () => {
    if (!booking) return 'Unknown'
    return booking.owner_name || 
      (booking.owner_first_name && booking.owner_last_name ? 
        `${booking.owner_first_name} ${booking.owner_last_name}` : 
        booking.owner_first_name || 'Unknown')
  }

  const getContactPhone = () => {
    if (!booking) return 'No phone provided'
    return booking.contact_phone ? 
      (booking.contact_area_code ? 
        `${booking.contact_area_code}-${booking.contact_phone}` : 
        booking.contact_phone) : 
      'No phone provided'
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'assessment', label: 'Assessment Details', icon: Heart },
    { id: 'payment', label: 'Payment & Billing', icon: DollarSign },
    { id: 'communication', label: 'Email & Communication', icon: MailCheck },
    { id: 'documents', label: 'Documents', icon: Download },
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
          <div className="h-48 bg-neutral-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Booking Not Found</h1>
          <p className="text-neutral-600 mb-6">The booking you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => router.back()}
            className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Booking Details
            </h1>
            <p className="text-neutral-600">
              {booking.booking_token} • {getOwnerName()} & {booking.dog_name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
          {booking.booking_status && (
            <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded text-sm">
              {booking.booking_status}
            </span>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <select
            value={booking.status}
            onChange={(e) => updateBookingStatus(e.target.value)}
            disabled={updating}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Send className="h-4 w-4" />
            <span>Send Email</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Generate PDF</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors">
            <Edit className="h-4 w-4" />
            <span>Edit Booking</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 mb-6">
        <div className="border-b border-neutral-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Key Information */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Dog Information */}
                <div className="bg-neutral-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Dog className="h-5 w-5 text-amber-600" />
                    </div>
                    <h3 className="font-medium text-neutral-900">Dog Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-neutral-900 text-lg">{booking.dog_name}</p>
                      {(booking.dog_first_name || booking.dog_last_name) && (
                        <p className="text-sm text-neutral-500">
                          Full name: {booking.dog_first_name} {booking.dog_last_name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-neutral-600">Breed:</span> {booking.dog_breed || 'Not specified'}</p>
                      <p><span className="text-neutral-600">Age:</span> {booking.dog_age || 'Not specified'}</p>
                      <p><span className="text-neutral-600">Gender & Neuter:</span> {booking.dog_gender_neuter || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div className="bg-neutral-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-neutral-900">Owner Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-neutral-900">{getOwnerName()}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-neutral-400" />
                        <span>{booking.owner_email || 'No email provided'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-neutral-400" />
                        <span>{getContactPhone()}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-neutral-400 mt-0.5" />
                        <span className="leading-relaxed">{getFullAddress()}</span>
                      </div>
                      {booking.instagram && (
                        <p><span className="text-neutral-600">Instagram:</span> @{booking.instagram}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Appointment Information */}
                <div className="bg-neutral-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-medium text-neutral-900">Appointment</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-neutral-400" />
                      <span>{formatSingaporeDateForDisplay(booking.preferred_date)}</span>
                    </div>
                    {booking.preferred_time && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-neutral-400" />
                        <span>{formatSingaporeTimeForDisplay(createSingaporeDate(booking.preferred_date, booking.preferred_time))}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-neutral-400" />
                      <span>
                        {booking.location_type === 'home' ? 
                          `Home Visit (+$${booking.home_visit_fee || 25})` : 
                          'Clementi Woods Park (Free)'
                        }
                      </span>
                    </div>
                    {booking.payment_required && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Payment</span>
                          <span className={`text-sm px-2 py-1 rounded ${
                            booking.total_paid && booking.total_paid > 0 ? 
                              'bg-green-100 text-green-800' : 
                              'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.total_paid && booking.total_paid > 0 ? 
                              `Paid: $${booking.total_paid}` : 
                              `Due: $${booking.payment_amount || 25}`
                            }
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms and Signature Status */}
              {(booking.terms_accepted || booking.signature_completed) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {booking.terms_accepted && (
                    <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Terms Accepted</p>
                        <p className="text-sm text-green-700">
                          {booking.terms_accepted_at && formatSingaporeDateForDisplay(booking.terms_accepted_at)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {booking.signature_completed && (
                    <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Signature className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Digitally Signed</p>
                        <p className="text-sm text-blue-700">Agreement completed</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {booking.notes && (
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h3 className="font-medium text-neutral-900 mb-3">Notes</h3>
                  <p className="text-neutral-700 whitespace-pre-wrap">{booking.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Assessment Details Tab */}
          {activeTab === 'assessment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                Behavioral & Health Assessment
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Health Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-neutral-900 border-b border-neutral-200 pb-2">Health Information</h4>
                  
                  {booking.vaccination_status && (
                    <div className="flex items-center justify-between p-3 bg-neutral-50 rounded">
                      <span className="text-neutral-700">Vaccination Status</span>
                      <span className={`px-3 py-1 rounded text-sm ${
                        booking.vaccination_status === 'Yes' ? 
                          'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                      }`}>
                        {booking.vaccination_status}
                      </span>
                    </div>
                  )}

                  {booking.current_medical_issues && (
                    <div className="p-3 bg-blue-50 rounded">
                      <p className="font-medium text-blue-900 mb-1">Current Medical Issues</p>
                      <p className="text-blue-800 text-sm">{booking.current_medical_issues}</p>
                    </div>
                  )}

                  {booking.food_allergies && (
                    <div className="p-3 bg-yellow-50 rounded">
                      <p className="font-medium text-yellow-900 mb-1">Food Allergies</p>
                      <p className="text-yellow-800 text-sm">{booking.food_allergies}</p>
                    </div>
                  )}
                </div>

                {/* Behavioral Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-neutral-900 border-b border-neutral-200 pb-2">Behavioral Assessment</h4>
                  
                  {booking.bite_history && (
                    <div className="flex items-center justify-between p-3 bg-neutral-50 rounded">
                      <span className="text-neutral-700">Bite History</span>
                      <span className={`px-3 py-1 rounded text-sm ${
                        booking.bite_history === 'No' ? 
                          'bg-green-100 text-green-800' : 
                          'bg-orange-100 text-orange-800'
                      }`}>
                        {booking.bite_history}
                      </span>
                    </div>
                  )}

                  {booking.reaction_to_new_people && (
                    <div className="p-3 bg-purple-50 rounded">
                      <p className="font-medium text-purple-900 mb-1">Reaction to New People</p>
                      <p className="text-purple-800 text-sm">
                        {Array.isArray(booking.reaction_to_new_people) ? 
                          booking.reaction_to_new_people.join(', ') : 
                          booking.reaction_to_new_people
                        }
                      </p>
                    </div>
                  )}

                  {booking.anxiety_new_environments && (
                    <div className="p-3 bg-neutral-50 rounded">
                      <p className="font-medium text-neutral-900 mb-1">Anxiety in New Environments</p>
                      <p className="text-neutral-700 text-sm">{booking.anxiety_new_environments}</p>
                    </div>
                  )}

                  {booking.behavior_when_alone && (
                    <div className="p-3 bg-neutral-50 rounded">
                      <p className="font-medium text-neutral-900 mb-1">Behavior When Alone</p>
                      <p className="text-neutral-700 text-sm">{booking.behavior_when_alone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Assessment Details */}
              {(booking.uncomfortable_situations || booking.reactivity_details || booking.sensitive_body_areas || booking.aggression_details || booking.thunderstorm_response) && (
                <div className="space-y-4">
                  <h4 className="font-medium text-neutral-900 border-b border-neutral-200 pb-2">Additional Details</h4>
                  
                  {booking.uncomfortable_situations && (
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <p className="font-medium text-neutral-900 mb-2">Uncomfortable Situations</p>
                      <p className="text-neutral-700">{booking.uncomfortable_situations}</p>
                    </div>
                  )}

                  {booking.reactivity_details && (
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <p className="font-medium text-neutral-900 mb-2">Reactivity Details</p>
                      <p className="text-neutral-700">{booking.reactivity_details}</p>
                    </div>
                  )}

                  {booking.sensitive_body_areas && (
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <p className="font-medium text-neutral-900 mb-2">Sensitive Body Areas</p>
                      <p className="text-neutral-700">{booking.sensitive_body_areas}</p>
                    </div>
                  )}

                  {booking.aggression_details && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="font-medium text-red-900 mb-2">Aggression Details</p>
                      <p className="text-red-800">{booking.aggression_details}</p>
                    </div>
                  )}

                  {booking.thunderstorm_response && (
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <p className="font-medium text-neutral-900 mb-2">Thunderstorm Response</p>
                      <p className="text-neutral-700">{booking.thunderstorm_response}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                Payment & Billing Information
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h4 className="font-medium text-neutral-900 mb-3">Payment Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Service Type</span>
                      <span className="font-medium">
                        {booking.location_type === 'home' ? 'Home Visit Assessment' : 'Park Assessment'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Base Fee</span>
                      <span className="font-medium">
                        {booking.location_type === 'home' ? `$${booking.home_visit_fee || 25}` : 'Free'}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-neutral-200 pt-3">
                      <span className="font-medium text-neutral-900">Total Amount</span>
                      <span className="font-bold text-lg">
                        ${booking.payment_amount || booking.home_visit_fee || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Amount Paid</span>
                      <span className={`font-medium ${
                        booking.total_paid && booking.total_paid > 0 ? 'text-green-600' : 'text-neutral-900'
                      }`}>
                        ${booking.total_paid || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-lg p-4">
                  <h4 className="font-medium text-neutral-900 mb-3">Payment Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        booking.payment_required ? 'bg-yellow-500' : 'bg-gray-300'
                      }`}></div>
                      <span>Payment Required: {booking.payment_required ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        booking.total_paid && booking.total_paid > 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span>Payment Status: {
                        booking.total_paid && booking.total_paid > 0 ? 'Paid' : 
                        booking.payment_required ? 'Pending' : 'Not Required'
                      }</span>
                    </div>
                  </div>
                </div>
              </div>

              {booking.payment_required && (
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-neutral-900">Payment Actions</h4>
                  </div>
                  <div className="flex space-x-3">
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      Generate Invoice
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Send Payment Link
                    </button>
                    <button className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors">
                      Mark as Paid
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Communication Tab */}
          {activeTab === 'communication' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center">
                <MailCheck className="h-5 w-5 mr-2 text-blue-500" />
                Email Confirmation Status
              </h3>

              {/* Email Status Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h4 className="font-medium text-neutral-900 mb-4">Confirmation Email Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Email Sent</span>
                      <span className={`flex items-center space-x-2 ${
                        booking.confirmation_email_sent ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {booking.confirmation_email_sent ? (
                          <><CheckCircle2 className="h-4 w-4" /><span>Yes</span></>
                        ) : (
                          <><XCircle className="h-4 w-4" /><span>No</span></>
                        )}
                      </span>
                    </div>
                    
                    {booking.confirmation_email_sent_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-600">Sent At</span>
                        <span className="text-neutral-900">
                          {formatSingaporeDateForDisplay(booking.confirmation_email_sent_at)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Send Attempts</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        (booking.email_send_attempts || 0) === 0 ? 'bg-neutral-100 text-neutral-600' :
                        (booking.email_send_attempts || 0) === 1 ? 'bg-green-100 text-green-600' :
                        (booking.email_send_attempts || 0) <= 3 ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {booking.email_send_attempts || 0}
                      </span>
                    </div>

                    {booking.last_email_error && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="font-medium text-red-900">Last Error</span>
                        </div>
                        <p className="text-sm text-red-800">{booking.last_email_error}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-lg p-4">
                  <h4 className="font-medium text-neutral-900 mb-4">Email Content Includes</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Booking confirmation form</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Terms & Conditions with signature</span>
                    </div>
                    {booking.payment_required && (
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Payment invoice</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Assessment details</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Actions */}
              <div className="bg-white border border-neutral-200 rounded-lg p-4">
                <h4 className="font-medium text-neutral-900 mb-4">Email Actions</h4>
                <div className="flex flex-wrap gap-3">
                  <button 
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      booking.confirmation_email_sent
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {booking.confirmation_email_sent ? 'Resend Confirmation Email' : 'Send Confirmation Email'}
                  </button>
                  
                  <button className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors">
                    View Email Preview
                  </button>
                  
                  {booking.last_email_error && (
                    <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                      Retry Failed Email
                    </button>
                  )}
                </div>
                
                {!booking.confirmation_email_sent && booking.owner_email && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Recipient:</strong> {booking.owner_email}
                    </p>
                  </div>
                )}
              </div>

              {/* Email System Status */}
              <div className="bg-neutral-50 rounded-lg p-4">
                <h4 className="font-medium text-neutral-900 mb-3">System Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-600">Email System:</span>
                    <span className="ml-2 text-green-600 font-medium">Nodemailer (Active)</span>
                  </div>
                  <div>
                    <span className="text-neutral-600">Webhook Status:</span>
                    <span className="ml-2 text-green-600 font-medium">Configured</span>
                  </div>
                  <div>
                    <span className="text-neutral-600">Backup System:</span>
                    <span className="ml-2 text-blue-600 font-medium">Payment Verification API</span>
                  </div>
                  <div>
                    <span className="text-neutral-600">PDF Generation:</span>
                    <span className="ml-2 text-green-600 font-medium">jsPDF (Active)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center">
                <Download className="h-5 w-5 mr-2 text-purple-500" />
                Documents & Files
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium text-neutral-900">Booking Confirmation</p>
                      <p className="text-sm text-neutral-600">PDF Document</p>
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                    Generate & Download
                  </button>
                </div>

                <div className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <Shield className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="font-medium text-neutral-900">Terms & Conditions</p>
                      <p className="text-sm text-neutral-600">Signed Agreement</p>
                    </div>
                  </div>
                  <button 
                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                    disabled={!booking.signature_completed}
                  >
                    {booking.signature_completed ? 'Download Agreement' : 'Not Signed Yet'}
                  </button>
                </div>

                {booking.payment_required && (
                  <div className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-3">
                      <DollarSign className="h-8 w-8 text-amber-500" />
                      <div>
                        <p className="font-medium text-neutral-900">Invoice</p>
                        <p className="text-sm text-neutral-600">Payment Receipt</p>
                      </div>
                    </div>
                    <button className="w-full bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-700 transition-colors">
                      Generate Invoice
                    </button>
                  </div>
                )}
              </div>

              {booking.signature_data && (
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                  <h4 className="font-medium text-neutral-900 mb-4">Digital Signature</h4>
                  <div className="bg-neutral-50 rounded border-2 border-dashed border-neutral-300 p-4">
                    <img 
                      src={booking.signature_data} 
                      alt="Digital Signature" 
                      className="max-w-xs mx-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Booking Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-4">Booking Timeline</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-neutral-900">Booking Created</p>
              <p className="text-sm text-neutral-600">
                {formatSingaporeDateForDisplay(booking.created_at)} • Initial booking request submitted
              </p>
            </div>
          </div>

          {booking.terms_accepted_at && (
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-900">Terms Accepted</p>
                <p className="text-sm text-neutral-600">
                  {formatSingaporeDateForDisplay(booking.terms_accepted_at)} • Customer agreed to terms and conditions
                </p>
              </div>
            </div>
          )}

          {booking.signature_completed && (
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Signature className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-900">Agreement Signed</p>
                <p className="text-sm text-neutral-600">Digital signature completed</p>
              </div>
            </div>
          )}

          {booking.updated_at && booking.updated_at !== booking.created_at && (
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <Edit className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-900">Last Updated</p>
                <p className="text-sm text-neutral-600">
                  {formatSingaporeDateForDisplay(booking.updated_at)} • Booking information modified
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}