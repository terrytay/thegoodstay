import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import BookingForm from "@/components/booking-form";
import { Calendar, Clock, CheckCircle, Heart } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Assessment Visit",
  description:
    "Schedule a complimentary assessment visit to ensure we're the perfect match for your dog. Professional dog boarding consultation with no obligation.",
  keywords: [
    "dog boarding assessment",
    "pet consultation",
    "dog boarding consultation",
    "assessment visit",
    "dog care evaluation",
  ],
  openGraph: {
    title: "Book Assessment Visit | The Good Stay",
    description:
      "Schedule a complimentary assessment visit to ensure we're the perfect match for your dog.",
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
              Book Your Assessment Visit
            </h1>
            <p className="font-lora text-xl md:text-2xl text-stone-700 mb-16 leading-relaxed">
              Start your journey with a complimentary consultation to ensure
              we&apos;re the perfect match for your furry friend.
            </p>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-stone-200 max-w-md mx-auto">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-lora font-semibold text-stone-900">
                    100% Free Assessment
                  </p>
                  <p className="font-lora text-stone-600">
                    No obligation, just getting to know each other
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
                  1. Schedule Your Visit
                </h3>
                <p className="font-lora text-stone-600 leading-relaxed">
                  Choose a convenient time that works for you and your dog.
                  We&apos;ll meet at my location for the assessment.
                </p>
              </div>

              <div className="text-center group">
                <div className="bg-green-100 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                  <Heart className="h-10 w-10 text-green-700" />
                </div>
                <h3 className="font-crimson text-2xl font-normal text-stone-900 mb-4">
                  2. Meet & Greet
                </h3>
                <p className="font-lora text-stone-600 leading-relaxed">
                  We&apos;ll spend time getting to know your dog&apos;s
                  personality, needs, and preferences in a relaxed environment.
                </p>
              </div>

              <div className="text-center group">
                <div className="bg-blue-100 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                  <Clock className="h-10 w-10 text-blue-700" />
                </div>
                <h3 className="font-crimson text-2xl font-normal text-stone-900 mb-4">
                  3. Discussion & Planning
                </h3>
                <p className="font-lora text-stone-600 leading-relaxed">
                  We&apos;ll discuss your dog&apos;s routine, any special needs,
                  and see if we&apos;re a good fit for future boarding.
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
