import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Heart, Shield, Star } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6">
              <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-neutral-600 font-medium">Trusted by 200+ pet families</span>
              </div>
              
              <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight mb-6">
                Your Dog&apos;s Home Away From{' '}
                <span className="text-amber-600">Home</span>
              </h1>
              
              <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Professional dog boarding and care services with personalized attention. 
                Start with an assessment visit to ensure the perfect match for your furry family member.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-8">
              <div className="flex items-center space-x-2 text-neutral-600">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Fully Insured</span>
              </div>
              <div className="flex items-center space-x-2 text-neutral-600">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium">Personalized Care</span>
              </div>
              <div className="flex items-center space-x-2 text-neutral-600">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Flexible Scheduling</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/book-assessment"
                className="group bg-amber-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-amber-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Book Assessment Visit
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
              
              <Link
                href="/shop"
                className="border-2 border-amber-600 text-amber-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-amber-600 hover:text-white transition-all duration-300"
              >
                Shop Treats & More
              </Link>
            </div>
          </div>

          {/* Right Content - Hero Image/Logo */}
          <div className="relative">
            <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
              {/* Main Logo */}
              <div className="relative z-10 bg-white rounded-3xl p-8 shadow-2xl">
                <Image
                  src="/logo.jpg"
                  alt="The Good Stay Logo"
                  width={400}
                  height={400}
                  className="w-full h-auto rounded-2xl"
                  priority
                />
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-200 rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-orange-200 rounded-full opacity-60 animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 -left-8 w-12 h-12 bg-yellow-200 rounded-full opacity-60 animate-pulse delay-500"></div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-neutral-400 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-neutral-400 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}