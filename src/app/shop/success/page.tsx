"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import Link from "next/link";
import { CheckCircle, Package, Truck, Mail } from "lucide-react";
import { useCart } from "@/context/cart-context";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
  const [orderData, setOrderData] = useState<{
    payment_status: string;
    amount_total: number;
    customer_email?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await fetch(`/api/checkout?session_id=${sessionId}`);
        const data = await response.json();

        if (data.session) {
          setOrderData(data.session);
          // Clear the cart after successful order confirmation
          clearCart();
        }
      } catch (error) {
        console.error("Error fetching order data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchOrderData();
    } else {
      setLoading(false);
    }
  }, [sessionId, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navigation />
        <main className="pt-20 md:pt-24">
          <div className="max-w-4xl mx-auto px-8 lg:px-12 py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
              <p className="mt-4 font-lora text-stone-600">
                Processing your order...
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!sessionId || !orderData) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navigation />
        <main className="pt-20 md:pt-24">
          <div className="max-w-4xl mx-auto px-8 lg:px-12 py-16">
            <div className="text-center">
              <h1 className="font-crimson text-3xl font-normal text-stone-900 mb-4">
                Order Not Found
              </h1>
              <p className="font-lora text-stone-600 mb-8">
                We couldn&apos;t find your order information. Please contact us
                if you need assistance.
              </p>
              <Link
                href="/shop"
                className="bg-stone-800 text-amber-50 px-8 py-3 font-lora font-medium tracking-wide uppercase hover:bg-stone-700 transition-colors rounded-lg shadow-lg hover:shadow-xl"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navigation />

      <main className="pt-20 md:pt-24">
        {/* Success Header */}
        <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-24">
          <div className="max-w-4xl mx-auto px-8 lg:px-12 text-center">
            <div className="bg-green-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            <h1 className="font-crimson text-4xl md:text-5xl font-normal text-stone-900 mb-6">
              Order Confirmed!
            </h1>
            <p className="font-lora text-xl text-stone-700 max-w-2xl mx-auto mb-8 leading-relaxed">
              Thank you for your purchase! Your order has been successfully
              placed and you&apos;ll receive a confirmation email shortly.
            </p>

            {orderData.customer_email && (
              <div className="bg-white rounded-2xl p-8 shadow-lg inline-block border border-stone-200">
                <p className="font-lora text-stone-600 mb-2">
                  Order confirmation sent to:
                </p>
                <p className="font-lora font-semibold text-stone-900">
                  {orderData.customer_email}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Order Details */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-8 lg:px-12">
            <div className="grid md:grid-cols-2 gap-16">
              {/* Order Summary */}
              <div className="bg-stone-50 rounded-2xl p-8">
                <h2 className="font-crimson text-2xl font-normal text-stone-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-lora text-stone-600">Order ID</span>
                    <span className="font-mono text-stone-900">
                      #{sessionId?.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-lora text-stone-600">
                      Payment Status
                    </span>
                    <span className="text-green-600 font-lora font-medium capitalize">
                      {orderData.payment_status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-lora text-stone-600">
                      Total Amount
                    </span>
                    <span className="font-lora font-semibold text-lg text-stone-900">
                      ${(orderData.amount_total / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-stone-200 pt-6">
                  <h3 className="font-lora font-medium text-stone-900 mb-4">
                    Payment Method
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-800 rounded text-white text-xs flex items-center justify-center">
                      CARD
                    </div>
                    <span className="font-lora text-stone-600 text-sm">
                      Card ending in ****
                    </span>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <div className="bg-gradient-to-br from-amber-50 to-stone-100 rounded-2xl p-8">
                <h2 className="font-crimson text-2xl font-normal text-stone-900 mb-6">
                  What&apos;s Next?
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-lora font-medium text-stone-900">
                        Email Confirmation
                      </h3>
                      <p className="font-lora text-stone-600 text-sm mt-1 leading-relaxed">
                        You&apos;ll receive an order confirmation email within
                        the next few minutes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-amber-100 p-3 rounded-full">
                      <Package className="h-6 w-6 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="font-lora font-medium text-stone-900">
                        Order Processing
                      </h3>
                      <p className="font-lora text-stone-600 text-sm mt-1 leading-relaxed">
                        We&apos;ll carefully pack your items within 1-2 business
                        days.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Truck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-lora font-medium text-stone-900">
                        Shipping
                      </h3>
                      <p className="font-lora text-stone-600 text-sm mt-1 leading-relaxed">
                        Your order will be shipped and you&apos;ll receive
                        tracking information.
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
                  href="/shop"
                  className="bg-stone-800 text-amber-50 px-8 py-3 font-lora font-medium tracking-wide uppercase hover:bg-stone-700 transition-colors rounded-lg shadow-lg hover:shadow-xl"
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/contact"
                  className="border-2 border-stone-800 text-stone-800 px-8 py-3 font-lora font-medium tracking-wide uppercase hover:bg-stone-800 hover:text-amber-50 transition-colors rounded-lg"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-16 bg-gradient-to-br from-amber-50 to-stone-100 rounded-2xl p-8 border border-stone-200">
              <h3 className="font-crimson text-2xl font-normal text-stone-900 mb-6">
                Need Help?
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-lora font-medium text-stone-900 mb-3">
                    Questions about your order?
                  </h4>
                  <p className="font-lora text-stone-600 mb-4 leading-relaxed">
                    Contact us and we&apos;ll be happy to help with any
                    questions or concerns.
                  </p>
                  <Link
                    href="/contact"
                    className="text-amber-700 hover:text-amber-800 font-lora font-medium"
                  >
                    Get in Touch →
                  </Link>
                </div>
                <div>
                  <h4 className="font-lora font-medium text-stone-900 mb-3">
                    Track your order
                  </h4>
                  <p className="font-lora text-stone-600 mb-4 leading-relaxed">
                    Once your order ships, you&apos;ll receive tracking
                    information via email.
                  </p>
                  <p className="text-amber-700 font-lora font-medium">
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
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
