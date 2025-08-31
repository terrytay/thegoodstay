'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Calendar, Clock, MapPin, User, Dog, CreditCard, Loader } from 'lucide-react';

interface BookingData {
  id: string;
  booking_token: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_email: string;
  dog_name: string;
  dog_breed: string;
  dog_age: string;
  preferred_date: string;
  preferred_time: string;
  location_type: string;
  payment_required: boolean;
  payment_amount: number;
  total_paid: number;
  created_at: string;
  contact_area_code: string;
  contact_phone: string;
  address_street1: string;
  address_city: string;
  address_postal_code: string;
  booking_status: string;
  // Email tracking fields
  confirmation_email_sent: boolean;
  confirmation_email_sent_at: string | null;
  email_send_attempts: number;
}

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    async function verifyPaymentAndFetchBooking() {
      if (!sessionId) {
        setError('Invalid payment session');
        setLoading(false);
        return;
      }

      try {
        // Verify payment session and get booking details
        const response = await fetch(`/api/verify-payment/${sessionId}`);
        if (!response.ok) {
          throw new Error('Payment verification failed');
        }
        
        const data = await response.json();
        setBooking(data.booking);
        setPaymentVerified(data.paymentVerified);
      } catch (err) {
        setError('Failed to verify payment and load booking details');
        console.error('Error verifying payment:', err);
      } finally {
        setLoading(false);
      }
    }

    verifyPaymentAndFetchBooking();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-amber-500 mx-auto mb-4" />
          <p className="font-lora text-stone-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
            <div className="h-12 w-12 text-red-600">⚠️</div>
          </div>
          <h1 className="font-crimson text-2xl font-normal text-stone-900 mb-4">
            Payment Verification Failed
          </h1>
          <p className="font-lora text-stone-600 mb-6">
            {error || 'We were unable to verify your payment. Please contact us for assistance.'}
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-amber-500 text-white px-6 py-3 rounded-lg font-lora hover:bg-amber-600 transition-colors mr-4"
          >
            Contact Support
          </a>
          <a 
            href="/" 
            className="inline-block bg-stone-500 text-white px-6 py-3 rounded-lg font-lora hover:bg-stone-600 transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-SG', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="bg-green-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            
            <h1 className="font-crimson text-4xl md:text-5xl font-normal text-stone-900 mb-4">
              Payment Successful!
            </h1>
            
            <p className="font-lora text-xl text-stone-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              Thank you for your payment. Your booking has been confirmed.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 inline-block">
              <div className="flex items-center text-green-800">
                <CreditCard className="h-5 w-5 mr-2" />
                <span className="font-lora font-medium">
                  Payment Completed - SGD ${booking.total_paid || booking.payment_amount}
                </span>
              </div>
            </div>

            {/* Email Status Section */}
            <div className="mb-8">
              {booking.confirmation_email_sent ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
                  <div className="flex items-center text-blue-800">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-lora font-medium">
                      Confirmation email sent successfully!
                    </span>
                  </div>
                  {booking.confirmation_email_sent_at && (
                    <p className="text-blue-700 text-sm mt-1">
                      Sent at {new Date(booking.confirmation_email_sent_at).toLocaleString('en-SG')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 inline-block">
                  <div className="flex items-center text-amber-800">
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    <span className="font-lora font-medium">
                      Preparing your confirmation email...
                    </span>
                  </div>
                  <p className="text-amber-700 text-sm mt-1">
                    You'll receive a detailed email with your booking forms and invoice within the next few minutes.
                  </p>
                </div>
              )}</div>
          </div>

          {/* Booking Details Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-amber-500 to-stone-600 p-6 text-white">
              <h2 className="font-crimson text-2xl font-normal mb-2">Booking Details</h2>
              <p className="opacity-90">Booking ID: {booking.booking_token || booking.id}</p>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <User className="h-6 w-6 text-amber-500 mt-1" />
                    <div>
                      <h3 className="font-lora font-semibold text-stone-900 mb-1">Owner Information</h3>
                      <p className="text-stone-700">{booking.owner_first_name} {booking.owner_last_name}</p>
                      <p className="text-stone-600">{booking.owner_email}</p>
                      <p className="text-stone-600">+{booking.contact_area_code} {booking.contact_phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Dog className="h-6 w-6 text-amber-500 mt-1" />
                    <div>
                      <h3 className="font-lora font-semibold text-stone-900 mb-1">Dog Information</h3>
                      <p className="text-stone-700">{booking.dog_name}</p>
                      <p className="text-stone-600">{booking.dog_breed}, {booking.dog_age} old</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-amber-500 mt-1" />
                    <div>
                      <h3 className="font-lora font-semibold text-stone-900 mb-1">Location</h3>
                      <p className="text-stone-700">
                        {booking.location_type === 'home' ? 'Home Visit' : 'Facility Visit'}
                      </p>
                      {booking.location_type === 'home' && (
                        <p className="text-stone-600">
                          {booking.address_street1}, {booking.address_city} {booking.address_postal_code}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Calendar className="h-6 w-6 text-amber-500 mt-1" />
                    <div>
                      <h3 className="font-lora font-semibold text-stone-900 mb-1">Appointment Date</h3>
                      <p className="text-stone-700">{formatDate(booking.preferred_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Clock className="h-6 w-6 text-amber-500 mt-1" />
                    <div>
                      <h3 className="font-lora font-semibold text-stone-900 mb-1">Appointment Time</h3>
                      <p className="text-stone-700">{formatTime(booking.preferred_time)}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <CreditCard className="h-6 w-6 text-amber-500 mt-1" />
                    <div>
                      <h3 className="font-lora font-semibold text-stone-900 mb-1">Payment</h3>
                      <p className="text-stone-700">SGD ${booking.total_paid || booking.payment_amount}</p>
                      <p className="text-green-600 font-medium">✓ Paid</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-br from-amber-50 to-stone-100 rounded-2xl p-8 border border-stone-200">
            <h3 className="font-crimson text-2xl font-normal text-stone-900 mb-6">What Happens Next?</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-amber-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold">
                  1
                </div>
                <h4 className="font-lora font-semibold text-stone-900 mb-2">Email Confirmation</h4>
                <p className="font-lora text-stone-600 text-sm">
                  {booking.confirmation_email_sent 
                    ? "Check your email for detailed booking forms, terms & conditions, and invoice."
                    : "You'll receive a detailed confirmation email with your assessment form, terms & conditions, and invoice shortly."
                  }
                </p>
              </div>

              <div className="text-center">
                <div className="bg-amber-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold">
                  2
                </div>
                <h4 className="font-lora font-semibold text-stone-900 mb-2">Confirmation Call</h4>
                <p className="font-lora text-stone-600 text-sm">
                  We'll contact you within 24 hours to confirm the appointment details and answer any questions.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-amber-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold">
                  3
                </div>
                <h4 className="font-lora font-semibold text-stone-900 mb-2">Assessment Day</h4>
                <p className="font-lora text-stone-600 text-sm">
                  We'll send a reminder the day before, and our team will arrive at the scheduled time.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="text-center mt-12">
            <p className="font-lora text-stone-600 mb-4">
              Questions about your booking? Need to make changes?
            </p>
            <p className="font-lora text-stone-900 font-semibold">
              Contact us at{' '}
              <a href="mailto:hello@thegoodstay.com" className="text-amber-600 hover:text-amber-700">
                hello@thegoodstay.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-amber-500 mx-auto mb-4" />
          <p className="font-lora text-stone-600">Loading booking details...</p>
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}