'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle, CreditCard, ArrowLeft, Loader } from 'lucide-react';

function BookingCancelledContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 text-center">
        <div className="bg-orange-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <XCircle className="h-12 w-12 text-orange-600" />
        </div>

        <h1 className="font-crimson text-3xl md:text-4xl font-normal text-stone-900 mb-4">
          Payment Cancelled
        </h1>

        <p className="font-lora text-lg text-stone-600 mb-6 leading-relaxed">
          Your payment was cancelled and no charges were made to your card.
        </p>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-center text-orange-800 mb-2">
            <CreditCard className="h-5 w-5 mr-2" />
            <span className="font-lora font-medium">No Payment Processed</span>
          </div>
          <p className="text-orange-700 text-sm">
            Your booking is still pending. You can complete the payment anytime to confirm your appointment.
          </p>
        </div>

        <div className="space-y-4">
          <a
            href="/book-assessment"
            className="w-full inline-block bg-amber-500 text-white px-6 py-3 rounded-lg font-lora hover:bg-amber-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 inline mr-2" />
            Return to Booking
          </a>
          
          <a
            href="/"
            className="w-full inline-block bg-stone-500 text-white px-6 py-3 rounded-lg font-lora hover:bg-stone-600 transition-colors"
          >
            Go to Homepage
          </a>
        </div>

        <div className="mt-8 p-4 bg-stone-100 rounded-lg">
          <h3 className="font-lora font-semibold text-stone-900 mb-2">Need Help?</h3>
          <p className="font-lora text-stone-600 text-sm mb-2">
            If you experienced any issues during the payment process, please contact us.
          </p>
          <p className="font-lora text-stone-900 font-medium">
            <a href="mailto:hello@thegoodstay.com" className="text-amber-600 hover:text-amber-700">
              hello@thegoodstay.com
            </a>
          </p>
        </div>

        {sessionId && (
          <div className="mt-6 text-xs text-stone-500">
            Reference: {sessionId.slice(-8).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingCancelledPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-amber-500 mx-auto mb-4" />
          <p className="font-lora text-stone-600">Loading...</p>
        </div>
      </div>
    }>
      <BookingCancelledContent />
    </Suspense>
  );
}