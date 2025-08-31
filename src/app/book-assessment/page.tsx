import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import BookingForm from "@/components/booking-form";
import { Calendar, Clock, CheckCircle, Heart } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Professional Dog Assessment",
  description:
    "Schedule a professional dog behavioral and temperament assessment. Comprehensive evaluation to ensure the best care for your dog. $25 fee for home visits, free at our location.",
  keywords: [
    "dog behavioral assessment",
    "professional dog evaluation",
    "dog temperament assessment",
    "dog boarding assessment",
    "comprehensive dog evaluation",
  ],
  openGraph: {
    title: "Book Professional Dog Assessment | The Good Stay",
    description:
      "Professional dog behavioral and temperament assessment with comprehensive evaluation form.",
    url: "https://thegoodstay.vercel.app/book-assessment",
  },
};

export default function BookAssessmentPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navigation />

      <main className="pt-20 md:pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-amber-50 to-stone-100 py-24">
          <div className="max-w-4xl mx-auto px-8 lg:px-12 text-center">
            <h1 className="font-crimson text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-stone-900 mb-8 leading-tight">
              Professional Dog Assessment
            </h1>
            <p className="font-lora text-xl md:text-2xl text-stone-700 mb-16 leading-relaxed">
              Comprehensive behavioral and temperament evaluation to ensure the best care and compatibility for your dog.
            </p>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-stone-200 max-w-lg mx-auto">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-lora font-semibold text-stone-900">
                      Professional Assessment
                    </p>
                    <p className="font-lora text-stone-600">
                      Complete evaluation at Clementi Woods Park
                    </p>
                  </div>
                </div>
                <div className="bg-stone-50 rounded-lg p-4 border-l-4 border-amber-500">
                  <p className="font-lora text-sm text-stone-700">
                    <strong>Assessment Fee:</strong> $25.00 (non-refundable) for home visits
                  </p>
                  <p className="font-lora text-xs text-stone-600 mt-1">
                    Park location assessments included at no charge
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-8 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="font-crimson text-4xl md:text-5xl font-normal text-stone-900 mb-6">
                How the Assessment Works
              </h2>
              <div className="w-24 h-px bg-amber-600 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center group">
                <div className="bg-amber-100 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-200 transition-colors">
                  <Calendar className="h-10 w-10 text-amber-700" />
                </div>
                <h3 className="font-crimson text-2xl font-normal text-stone-900 mb-4">
                  1. Complete Assessment Form
                </h3>
                <p className="font-lora text-stone-600 leading-relaxed mb-3">
                  Fill out our comprehensive behavioral assessment form with detailed information about your dog.
                  We&apos;ll meet at <strong>Clementi Woods Park</strong> for the assessment.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                  <p className="font-lora text-amber-800 mb-2">
                    <strong>📍 Location:</strong> Clementi Woods Park
                  </p>
                  <p className="font-lora text-amber-800 mb-2">
                    <strong>🚗 Nearest Parking:</strong> 613 Clementi West St 1
                  </p>
                  <p className="font-lora text-amber-800">
                    <strong>💰 Home Visits:</strong> For assessments at your location, there will be an additional $25.00 fee
                  </p>
                </div>
              </div>

              <div className="text-center group">
                <div className="bg-green-100 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                  <Heart className="h-10 w-10 text-green-700" />
                </div>
                <h3 className="font-crimson text-2xl font-normal text-stone-900 mb-4">
                  2. Professional Evaluation
                </h3>
                <p className="font-lora text-stone-600 leading-relaxed">
                  Our team conducts a comprehensive behavioral assessment based on your form responses and direct interaction with your dog.
                </p>
              </div>

              <div className="text-center group">
                <div className="bg-blue-100 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                  <Clock className="h-10 w-10 text-blue-700" />
                </div>
                <h3 className="font-crimson text-2xl font-normal text-stone-900 mb-4">
                  3. Results & Recommendations  
                </h3>
                <p className="font-lora text-stone-600 leading-relaxed">
                  You&apos;ll receive detailed feedback on your dog&apos;s assessment and personalized recommendations for our boarding services.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Form Section */}
        <section className="py-24 bg-stone-100">
          <div className="max-w-4xl mx-auto px-8 lg:px-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
              <BookingForm />
            </div>
          </div>
        </section>

        {/* What to Expect */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-8 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="font-crimson text-4xl md:text-5xl font-normal text-stone-900 mb-6">
                What to Expect
              </h2>
              <div className="w-24 h-px bg-amber-600 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-16">
              <div className="bg-stone-50 rounded-2xl p-8">
                <h3 className="font-crimson text-2xl font-normal text-stone-900 mb-6">
                  During the Assessment
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="font-lora text-stone-600 leading-relaxed">
                      Tour of the boarding environment
                    </span>
                  </li>
                  <li className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="font-lora text-stone-600 leading-relaxed">
                      Discussion of your dog&apos;s daily routine
                    </span>
                  </li>
                  <li className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="font-lora text-stone-600 leading-relaxed">
                      Review of dietary requirements and medications
                    </span>
                  </li>
                  <li className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="font-lora text-stone-600 leading-relaxed">
                      Observation of your dog&apos;s behavior and comfort level
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 rounded-2xl p-8">
                <h3 className="font-crimson text-2xl font-normal text-stone-900 mb-6">
                  What to Bring
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="font-lora text-stone-600 leading-relaxed">
                      Your dog on a leash or in a carrier
                    </span>
                  </li>
                  <li className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="font-lora text-stone-600 leading-relaxed">
                      Vaccination records and health information
                    </span>
                  </li>
                  <li className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="font-lora text-stone-600 leading-relaxed">
                      Any special toys or comfort items
                    </span>
                  </li>
                  <li className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="font-lora text-stone-600 leading-relaxed">
                      List of questions or concerns
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-16 bg-gradient-to-br from-amber-50 to-stone-100 rounded-2xl p-8 text-center border border-stone-200">
              <h3 className="font-crimson text-2xl font-normal text-stone-900 mb-4">
                Assessment visits typically last 30-45 minutes
              </h3>
              <p className="font-lora text-stone-600 max-w-2xl mx-auto leading-relaxed">
                This gives us plenty of time to ensure your dog feels
                comfortable and allows us to discuss all aspects of their care.
                There&apos;s no pressure or commitment - we want what&apos;s
                best for your pet.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
