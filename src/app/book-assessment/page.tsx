import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import BookingForm from '@/components/booking-form'
import { Calendar, Clock, CheckCircle, Heart } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Book Assessment Visit",
  description: "Schedule a complimentary assessment visit to ensure we're the perfect match for your dog. Professional dog boarding consultation with no obligation.",
  keywords: ["dog boarding assessment", "pet consultation", "dog boarding consultation", "assessment visit", "dog care evaluation"],
  openGraph: {
    title: "Book Assessment Visit | The Good Stay",
    description: "Schedule a complimentary assessment visit to ensure we're the perfect match for your dog.",
    url: "https://thegoodstay.com/book-assessment",
  }
}

export default function BookAssessmentPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="font-playfair text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                Book Your Assessment Visit
              </h1>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
                Start your journey with a complimentary consultation to ensure we&apos;re the perfect match for your furry friend.
              </p>
              
              <div className="flex justify-center">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-neutral-900">100% Free Assessment</p>
                      <p className="text-neutral-600">No obligation, just getting to know each other</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-neutral-900 text-center mb-12">
              How the Assessment Works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-xl mb-3">1. Schedule Your Visit</h3>
                <p className="text-neutral-600">
                  Choose a convenient time that works for you and your dog. We&apos;ll meet at my location for the assessment.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-xl mb-3">2. Meet & Greet</h3>
                <p className="text-neutral-600">
                  We&apos;ll spend time getting to know your dog&apos;s personality, needs, and preferences in a relaxed environment.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-xl mb-3">3. Discussion & Planning</h3>
                <p className="text-neutral-600">
                  We&apos;ll discuss your dog&apos;s routine, any special needs, and see if we&apos;re a good fit for future boarding.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Form Section */}
        <section className="py-16 bg-neutral-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <BookingForm />
            </div>
          </div>
        </section>

        {/* What to Expect */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-neutral-900 text-center mb-12">
              What to Expect
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="font-semibold text-xl mb-4">During the Assessment</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600">Tour of the boarding environment</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600">Discussion of your dog&apos;s daily routine</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600">Review of dietary requirements and medications</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600">Observation of your dog&apos;s behavior and comfort level</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-xl mb-4">What to Bring</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600">Your dog on a leash or in a carrier</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600">Vaccination records and health information</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600">Any special toys or comfort items</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600">List of questions or concerns</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 bg-amber-50 rounded-2xl p-8 text-center border border-amber-200">
              <h3 className="font-semibold text-xl text-neutral-900 mb-4">
                Assessment visits typically last 30-45 minutes
              </h3>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                This gives us plenty of time to ensure your dog feels comfortable and allows us to discuss 
                all aspects of their care. There&apos;s no pressure or commitment - we want what&apos;s best for your pet.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}