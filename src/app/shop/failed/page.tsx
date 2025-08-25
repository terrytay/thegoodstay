'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import Link from 'next/link'
import { XCircle, RefreshCw, Mail, ArrowLeft } from 'lucide-react'

function FailedContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const sessionId = searchParams.get('session_id')

  return (
    <div className="min-h-screen bg-stone-50">
      <Navigation />
      
      <main className="pt-20 md:pt-24">
        {/* Failed Header */}
        <section className="bg-gradient-to-br from-red-50 to-rose-50 py-24">
          <div className="max-w-4xl mx-auto px-8 lg:px-12 text-center">
            <div className="bg-red-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            
            <h1 className="font-crimson text-4xl md:text-5xl font-normal text-stone-900 mb-6">
              Payment Failed
            </h1>
            <p className="font-lora text-xl text-stone-700 max-w-2xl mx-auto mb-8 leading-relaxed">
              We&apos;re sorry, but your payment could not be processed. Don&apos;t worry - no charges have been made to your account.
            </p>
            
            {error && (
              <div className="bg-white rounded-2xl p-8 shadow-lg inline-block border border-red-200 max-w-lg">
                <p className="font-lora text-stone-600 mb-2">Error details:</p>
                <p className="font-lora font-medium text-red-600">{error}</p>
              </div>
            )}
          </div>
        </section>

        {/* What Went Wrong & Solutions */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-8 lg:px-12">
            <div className="grid md:grid-cols-2 gap-16">
              {/* Common Issues */}
              <div className="bg-stone-50 rounded-2xl p-8">
                <h2 className="font-crimson text-2xl font-normal text-stone-900 mb-6">Common Issues</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-lora font-medium text-stone-900 mb-2">Card Details</h3>
                    <p className="font-lora text-stone-600 text-sm leading-relaxed">
                      Double-check your card number, expiry date, and security code for any typos.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-lora font-medium text-stone-900 mb-2">Insufficient Funds</h3>
                    <p className="font-lora text-stone-600 text-sm leading-relaxed">
                      Ensure your account has sufficient balance or credit limit available.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-lora font-medium text-stone-900 mb-2">Bank Restrictions</h3>
                    <p className="font-lora text-stone-600 text-sm leading-relaxed">
                      Your bank may have blocked the transaction for security reasons. Contact them to authorize.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-lora font-medium text-stone-900 mb-2">Expired Card</h3>
                    <p className="font-lora text-stone-600 text-sm leading-relaxed">
                      Check if your card has expired and needs to be replaced.
                    </p>
                  </div>
                </div>
              </div>

              {/* What to Do Next */}
              <div className="bg-gradient-to-br from-amber-50 to-stone-100 rounded-2xl p-8">
                <h2 className="font-crimson text-2xl font-normal text-stone-900 mb-6">What to Do Next</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <RefreshCw className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-lora font-medium text-stone-900">Try Again</h3>
                      <p className="font-lora text-stone-600 text-sm mt-1 leading-relaxed">
                        Go back to your cart and attempt the payment again with the correct details.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-amber-100 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="font-lora font-medium text-stone-900">Contact Your Bank</h3>
                      <p className="font-lora text-stone-600 text-sm mt-1 leading-relaxed">
                        If the problem persists, contact your bank to ensure there are no restrictions.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-lora font-medium text-stone-900">Get Help</h3>
                      <p className="font-lora text-stone-600 text-sm mt-1 leading-relaxed">
                        Contact us if you continue to experience issues - we&apos;re here to help.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-16 text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/shop/cart"
                  className="bg-stone-800 text-amber-50 px-8 py-3 font-lora font-medium tracking-wide uppercase hover:bg-stone-700 transition-colors rounded-lg shadow-lg hover:shadow-xl"
                >
                  <ArrowLeft size={18} className="inline mr-2" />
                  Return to Cart
                </Link>
                <Link
                  href="/contact"
                  className="border-2 border-stone-800 text-stone-800 px-8 py-3 font-lora font-medium tracking-wide uppercase hover:bg-stone-800 hover:text-amber-50 transition-colors rounded-lg"
                >
                  Contact Support
                </Link>
              </div>
            </div>

            {/* Additional Help */}
            <div className="mt-16 bg-gradient-to-br from-amber-50 to-stone-100 rounded-2xl p-8 border border-stone-200">
              <h3 className="font-crimson text-2xl font-normal text-stone-900 mb-6 text-center">Need Immediate Help?</h3>
              <div className="text-center">
                <p className="font-lora text-stone-600 mb-4 leading-relaxed">
                  If you&apos;re having trouble with your payment, don&apos;t hesitate to reach out. 
                  We&apos;re here to help you complete your purchase.
                </p>
                <Link 
                  href="/contact" 
                  className="text-amber-700 hover:text-amber-800 font-lora font-medium text-lg"
                >
                  Contact Us Directly →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default function FailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="font-lora text-stone-600">Loading...</p>
        </div>
      </div>
    }>
      <FailedContent />
    </Suspense>
  )
}