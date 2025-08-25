'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import Link from 'next/link'
import { CheckCircle, Package, Truck, Mail } from 'lucide-react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [orderData, setOrderData] = useState<{
    payment_status: string;
    amount_total: number;
    customer_email?: string;
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await fetch(`/api/checkout?session_id=${sessionId}`)
        const data = await response.json()
        
        if (data.session) {
          setOrderData(data.session)
        }
      } catch (error) {
        console.error('Error fetching order data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) {
      fetchOrderData()
    } else {
      setLoading(false)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
              <p className="mt-4 text-neutral-600">Processing your order...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!sessionId || !orderData) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-neutral-900 mb-4">
                Order Not Found
              </h1>
              <p className="text-neutral-600 mb-8">
                We couldn&apos;t find your order information. Please contact us if you need assistance.
              </p>
              <Link
                href="/shop"
                className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        {/* Success Header */}
        <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Order Confirmed!
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-8">
              Thank you for your purchase! Your order has been successfully placed and 
              you&apos;ll receive a confirmation email shortly.
            </p>
            
            {orderData.customer_email && (
              <div className="bg-white rounded-xl p-6 shadow-lg inline-block">
                <p className="text-sm text-neutral-600 mb-1">Order confirmation sent to:</p>
                <p className="font-semibold text-neutral-900">{orderData.customer_email}</p>
              </div>
            )}
          </div>
        </section>

        {/* Order Details */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="font-semibold text-xl mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Order ID</span>
                    <span className="font-mono text-sm">#{sessionId?.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Payment Status</span>
                    <span className="text-green-600 font-medium capitalize">
                      {orderData.payment_status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Total Amount</span>
                    <span className="font-semibold text-lg">
                      ${(orderData.amount_total / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Payment Method</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-800 rounded text-white text-xs flex items-center justify-center">
                      CARD
                    </div>
                    <span className="text-neutral-600 text-sm">
                      Card ending in ****
                    </span>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="font-semibold text-xl mb-6">What&apos;s Next?</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900">Email Confirmation</h3>
                      <p className="text-neutral-600 text-sm mt-1">
                        You&apos;ll receive an order confirmation email within the next few minutes.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Package className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900">Order Processing</h3>
                      <p className="text-neutral-600 text-sm mt-1">
                        We&apos;ll carefully pack your items within 1-2 business days.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Truck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900">Shipping</h3>
                      <p className="text-neutral-600 text-sm mt-1">
                        Your order will be shipped and you&apos;ll receive tracking information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-12 text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/shop"
                  className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/contact"
                  className="border border-amber-600 text-amber-600 px-8 py-3 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-16 bg-amber-50 rounded-xl p-8 border border-amber-200">
              <h3 className="font-semibold text-neutral-900 mb-4">Need Help?</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-neutral-800 mb-2">Questions about your order?</h4>
                  <p className="text-neutral-600 text-sm mb-2">
                    Contact us and we&apos;ll be happy to help with any questions or concerns.
                  </p>
                  <Link href="/contact" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                    Get in Touch →
                  </Link>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-800 mb-2">Track your order</h4>
                  <p className="text-neutral-600 text-sm mb-2">
                    Once your order ships, you&apos;ll receive tracking information via email.
                  </p>
                  <p className="text-amber-600 text-sm font-medium">
                    Tracking info coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}