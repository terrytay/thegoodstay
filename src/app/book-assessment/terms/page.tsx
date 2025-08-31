import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, AlertTriangle, Clock, DollarSign, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Assessment Terms & Conditions",
  description:
    "Terms and conditions for The Good Stay assessment visits, including fees, policies, and important information for pet owners.",
  keywords: [
    "assessment terms",
    "dog boarding conditions",
    "pet care policies",
    "assessment fees",
    "booking terms",
  ],
  openGraph: {
    title: "Assessment Terms & Conditions | The Good Stay",
    description:
      "Review our terms and conditions for assessment visits before booking.",
    url: "https://thegoodstay.vercel.app/book-assessment/terms",
  },
};

export default function AssessmentTermsPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navigation />

      <main className="pt-20 md:pt-24">
        {/* Header Section */}
        <section className="bg-gradient-to-br from-amber-50 to-stone-100 py-16">
          <div className="max-w-4xl mx-auto px-8 lg:px-12">
            <div className="mb-8">
              <Link
                href="/book-assessment"
                className="inline-flex items-center space-x-2 text-amber-700 hover:text-amber-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-lora">Back to Assessment Booking</span>
              </Link>
            </div>

            <div className="text-center">
              <h1 className="font-crimson text-4xl sm:text-5xl md:text-6xl font-normal text-stone-900 mb-6 leading-tight">
                Assessment Terms & Conditions
              </h1>
              <p className="font-lora text-lg md:text-xl text-stone-700 leading-relaxed max-w-3xl mx-auto">
                Please review these important terms and conditions before booking
                your assessment visit. By booking an assessment, you agree to
                these terms.
              </p>
            </div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-8 lg:px-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
              
              {/* Important Notice */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-crimson text-xl font-normal text-red-900 mb-2">
                      Important Notice
                    </h2>
                    <p className="font-lora text-red-800">
                      The $25.00 assessment fee for home visits is <strong>non-refundable</strong> 
                      regardless of the outcome of the assessment. This fee covers travel time, 
                      evaluation, and professional consultation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Assessment Locations & Fees */}
              <div className="mb-12">
                <h2 className="font-crimson text-2xl font-normal text-stone-900 mb-6 flex items-center">
                  <MapPin className="h-6 w-6 text-amber-600 mr-3" />
                  Assessment Locations & Fees
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-lora font-semibold text-green-900 mb-3">
                      Standard Assessment (No Fee)
                    </h3>
                    <div className="space-y-2 font-lora text-green-800">
                      <p><strong>Location:</strong> Clementi Woods Park</p>
                      <p><strong>Parking:</strong> 613 Clementi West St 1</p>
                      <p><strong>Fee:</strong> Free of charge</p>
                      <p><strong>Duration:</strong> 30-45 minutes</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h3 className="font-lora font-semibold text-amber-900 mb-3">
                      Home Visit Assessment
                    </h3>
                    <div className="space-y-2 font-lora text-amber-800">
                      <p><strong>Location:</strong> Your residence</p>
                      <p><strong>Fee:</strong> $25.00 (non-refundable)</p>
                      <p><strong>Payment:</strong> Due at time of assessment</p>
                      <p><strong>Duration:</strong> 45-60 minutes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Policies */}
              <div className="mb-12">
                <h2 className="font-crimson text-2xl font-normal text-stone-900 mb-6 flex items-center">
                  <Clock className="h-6 w-6 text-amber-600 mr-3" />
                  Booking & Cancellation Policies
                </h2>

                <div className="space-y-6">
                  <div className="border-l-4 border-amber-500 pl-6">
                    <h3 className="font-lora font-semibold text-stone-900 mb-2">
                      Advance Booking
                    </h3>
                    <p className="font-lora text-stone-700">
                      Assessments must be booked at least 3 hours in advance. 
                      We recommend booking 24-48 hours ahead to ensure availability.
                    </p>
                  </div>

                  <div className="border-l-4 border-amber-500 pl-6">
                    <h3 className="font-lora font-semibold text-stone-900 mb-2">
                      Cancellation Policy
                    </h3>
                    <p className="font-lora text-stone-700 mb-2">
                      For park assessments: Free cancellation up to 2 hours before scheduled time.
                    </p>
                    <p className="font-lora text-stone-700">
                      For home visits: $25.00 fee is non-refundable once assessment is confirmed. 
                      Rescheduling is allowed up to 4 hours before scheduled time.
                    </p>
                  </div>

                  <div className="border-l-4 border-amber-500 pl-6">
                    <h3 className="font-lora font-semibold text-stone-900 mb-2">
                      No-Show Policy
                    </h3>
                    <p className="font-lora text-stone-700">
                      If you fail to show up for your scheduled assessment without 
                      proper notice, you may be charged the full home visit fee ($25.00) 
                      regardless of assessment location.
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="mb-12">
                <h2 className="font-crimson text-2xl font-normal text-stone-900 mb-6 flex items-center">
                  <Shield className="h-6 w-6 text-amber-600 mr-3" />
                  Assessment Requirements
                </h2>

                <div className="space-y-4">
                  <div className="bg-stone-50 rounded-lg p-6">
                    <h3 className="font-lora font-semibold text-stone-900 mb-3">
                      Required Before Assessment
                    </h3>
                    <ul className="space-y-2 font-lora text-stone-700">
                      <li className="flex items-start">
                        <span className="text-amber-600 mr-2">•</span>
                        Completion of pre-assessment form
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-600 mr-2">•</span>
                        Current vaccination records
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-600 mr-2">•</span>
                        Your dog must be on leash or in carrier
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-600 mr-2">•</span>
                        Valid ID for dog owner/guardian
                      </li>
                    </ul>
                  </div>

                  <div className="bg-stone-50 rounded-lg p-6">
                    <h3 className="font-lora font-semibold text-stone-900 mb-3">
                      What We'll Discuss
                    </h3>
                    <ul className="space-y-2 font-lora text-stone-700">
                      <li className="flex items-start">
                        <span className="text-amber-600 mr-2">•</span>
                        Your dog's temperament and behavior
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-600 mr-2">•</span>
                        Daily routines and special needs
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-600 mr-2">•</span>
                        Medical history and medications
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-600 mr-2">•</span>
                        Boarding expectations and arrangements
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="mb-12">
                <h2 className="font-crimson text-2xl font-normal text-stone-900 mb-6 flex items-center">
                  <DollarSign className="h-6 w-6 text-amber-600 mr-3" />
                  Payment Terms
                </h2>

                <div className="space-y-4">
                  <div className="border-l-4 border-amber-500 pl-6">
                    <h3 className="font-lora font-semibold text-stone-900 mb-2">
                      Home Visit Fee
                    </h3>
                    <p className="font-lora text-stone-700">
                      The $25.00 home visit fee is payable in cash at the time of assessment. 
                      This fee covers travel time, fuel costs, and the convenience of meeting 
                      at your location.
                    </p>
                  </div>

                  <div className="border-l-4 border-amber-500 pl-6">
                    <h3 className="font-lora font-semibold text-stone-900 mb-2">
                      Refund Policy
                    </h3>
                    <p className="font-lora text-stone-700">
                      The assessment fee is non-refundable regardless of whether you decide 
                      to proceed with our boarding services. The fee compensates for the 
                      professional evaluation and time invested in your consultation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Liability & Safety */}
              <div className="mb-12">
                <h2 className="font-crimson text-2xl font-normal text-stone-900 mb-6">
                  Liability & Safety
                </h2>

                <div className="bg-stone-50 rounded-lg p-6">
                  <div className="space-y-4 font-lora text-stone-700">
                    <p>
                      During the assessment, you remain fully responsible for your dog's 
                      behavior and any incidents that may occur. We recommend keeping 
                      your dog leashed or secured throughout the visit.
                    </p>
                    <p>
                      The Good Stay reserves the right to discontinue an assessment if 
                      safety concerns arise or if your dog displays aggressive behavior 
                      that could endanger people or other animals.
                    </p>
                    <p>
                      By booking an assessment, you confirm that your dog is up-to-date 
                      on vaccinations and is in good health. Please inform us of any 
                      medical conditions or behavioral issues beforehand.
                    </p>
                  </div>
                </div>
              </div>

              {/* Agreement */}
              <div className="bg-gradient-to-br from-amber-50 to-stone-100 rounded-lg p-8 border border-amber-200">
                <h2 className="font-crimson text-2xl font-normal text-stone-900 mb-4">
                  Agreement to Terms
                </h2>
                <p className="font-lora text-stone-700 mb-6">
                  By proceeding with the booking process, you acknowledge that you have 
                  read, understood, and agree to abide by these terms and conditions. 
                  You also confirm that all information provided is accurate and complete.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/book-assessment"
                    className="bg-amber-600 text-white px-8 py-4 rounded-full text-center font-semibold hover:bg-amber-700 transition-colors"
                  >
                    I Agree - Proceed to Booking
                  </Link>
                  <Link
                    href="/"
                    className="bg-stone-200 text-stone-700 px-8 py-4 rounded-full text-center font-semibold hover:bg-stone-300 transition-colors"
                  >
                    Return to Homepage
                  </Link>
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