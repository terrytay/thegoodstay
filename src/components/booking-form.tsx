'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, User, Dog, FileText, Phone, Mail, CheckCircle } from 'lucide-react'

interface FormData {
  fullName: string
  email: string
  phone: string
  dogName: string
  dogBreed: string
  dogAge: string
  preferredDate: string
  preferredTime: string
  specialRequirements: string
}

export default function BookingForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    dogName: '',
    dogBreed: '',
    dogAge: '',
    preferredDate: '',
    preferredTime: '',
    specialRequirements: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const supabase = createClient()
      
      // Create or update user profile
      const { data: user, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        // For anonymous bookings, we'll just store the booking without user auth
        console.log('No authenticated user, proceeding with anonymous booking')
      }

      // Insert booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user?.user?.id || null,
          dog_name: formData.dogName,
          dog_breed: formData.dogBreed,
          dog_age: parseInt(formData.dogAge) || null,
          special_requirements: formData.specialRequirements,
          preferred_date: formData.preferredDate,
          preferred_time: formData.preferredTime,
          status: 'pending',
          notes: `Contact: ${formData.fullName}, Email: ${formData.email}, Phone: ${formData.phone}`
        })

      if (bookingError) {
        throw bookingError
      }

      // If no user is authenticated, create a profile record for contact purposes
      if (!user?.user?.id) {
        await supabase
          .from('profiles')
          .insert({
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone
          })
          .select()
      }

      setIsSubmitted(true)
    } catch (err) {
      console.error('Error submitting booking:', err)
      setError('There was an error submitting your booking. Please try again or contact us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="font-playfair text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
          Assessment Request Submitted!
        </h2>
        <p className="text-lg text-neutral-600 mb-6 max-w-2xl mx-auto">
          Thank you for your interest! We&apos;ll review your request and get back to you within 24 hours 
          to confirm your assessment visit details.
        </p>
        <div className="bg-amber-50 rounded-xl p-6 max-w-lg mx-auto border border-amber-200">
          <p className="text-neutral-700 font-medium">
            What happens next?
          </p>
          <ul className="text-left text-sm text-neutral-600 mt-3 space-y-1">
            <li>• We&apos;ll call or email you to confirm the appointment</li>
            <li>• You&apos;ll receive location details and preparation tips</li>
            <li>• We&apos;ll send a reminder the day before your visit</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="font-playfair text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
          Schedule Your Assessment Visit
        </h2>
        <p className="text-neutral-600">
          Fill out the form below and we&apos;ll get back to you within 24 hours to confirm your appointment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Owner Information */}
        <div className="bg-neutral-50 rounded-xl p-6">
          <h3 className="flex items-center space-x-2 font-semibold text-lg text-neutral-900 mb-4">
            <User className="h-5 w-5 text-amber-600" />
            <span>Your Information</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Your full name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        {/* Dog Information */}
        <div className="bg-neutral-50 rounded-xl p-6">
          <h3 className="flex items-center space-x-2 font-semibold text-lg text-neutral-900 mb-4">
            <Dog className="h-5 w-5 text-amber-600" />
            <span>About Your Dog</span>
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="dogName" className="block text-sm font-medium text-neutral-700 mb-2">
                Dog&apos;s Name *
              </label>
              <input
                type="text"
                id="dogName"
                name="dogName"
                value={formData.dogName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Max, Luna, etc."
              />
            </div>
            
            <div>
              <label htmlFor="dogBreed" className="block text-sm font-medium text-neutral-700 mb-2">
                Breed
              </label>
              <input
                type="text"
                id="dogBreed"
                name="dogBreed"
                value={formData.dogBreed}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Golden Retriever, Mixed, etc."
              />
            </div>
            
            <div>
              <label htmlFor="dogAge" className="block text-sm font-medium text-neutral-700 mb-2">
                Age (years)
              </label>
              <input
                type="number"
                id="dogAge"
                name="dogAge"
                value={formData.dogAge}
                onChange={handleChange}
                min="0"
                max="20"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="3"
              />
            </div>
          </div>
        </div>

        {/* Scheduling */}
        <div className="bg-neutral-50 rounded-xl p-6">
          <h3 className="flex items-center space-x-2 font-semibold text-lg text-neutral-900 mb-4">
            <Calendar className="h-5 w-5 text-amber-600" />
            <span>Preferred Schedule</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="preferredDate" className="block text-sm font-medium text-neutral-700 mb-2">
                Preferred Date *
              </label>
              <input
                type="date"
                id="preferredDate"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="preferredTime" className="block text-sm font-medium text-neutral-700 mb-2">
                Preferred Time
              </label>
              <select
                id="preferredTime"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select a time</option>
                <option value="09:00">9:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="17:00">5:00 PM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Special Requirements */}
        <div className="bg-neutral-50 rounded-xl p-6">
          <h3 className="flex items-center space-x-2 font-semibold text-lg text-neutral-900 mb-4">
            <FileText className="h-5 w-5 text-amber-600" />
            <span>Additional Information</span>
          </h3>
          
          <div>
            <label htmlFor="specialRequirements" className="block text-sm font-medium text-neutral-700 mb-2">
              Special Requirements or Notes
            </label>
            <textarea
              id="specialRequirements"
              name="specialRequirements"
              value={formData.specialRequirements}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              placeholder="Any special needs, medications, behavioral notes, or questions you'd like to discuss..."
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-amber-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-amber-700 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors duration-300 min-w-[200px]"
          >
            {isSubmitting ? 'Submitting...' : 'Request Assessment Visit'}
          </button>
          
          <p className="text-sm text-neutral-500 mt-4">
            * Required fields. We&apos;ll contact you within 24 hours to confirm your appointment.
          </p>
        </div>
      </form>
    </div>
  )
}