import Image from 'next/image'
import { Heart, MapPin, Clock, Award } from 'lucide-react'

export default function About() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Image */}
          <div className="relative">
            <div className="relative">
              <Image
                src="/bio.jpg"
                alt="Dog boarding specialist with two happy dogs"
                width={600}
                height={600}
                className="rounded-2xl shadow-2xl"
              />
              
              {/* Floating Stats Cards */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 max-w-xs">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">200+ Happy Dogs</p>
                    <p className="text-sm text-neutral-600">Boarded with love</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-6 -left-6 bg-amber-600 text-white rounded-xl shadow-lg p-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span className="font-semibold">5+ Years Experience</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div>
            <div className="mb-6">
              <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
                Meet Your Dog&apos;s New Best Friend
              </h2>
              
              <p className="text-lg text-neutral-600 mb-6">
                Hi, I&apos;m passionate about providing exceptional care for your furry family members. 
                With years of experience and genuine love for dogs, I understand that every pet is unique 
                and deserves personalized attention.
              </p>
              
              <p className="text-lg text-neutral-600 mb-8">
                My approach starts with getting to know you and your dog through an assessment visit. 
                This ensures we&apos;re the perfect match before any boarding arrangement, giving you complete 
                peace of mind when you&apos;re away.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-2 rounded-full mt-1">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Safe & Secure Environment</h3>
                  <p className="text-neutral-600">Fully fenced, dog-proofed space where your pet can play and relax safely.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-2 rounded-full mt-1">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Flexible Scheduling</h3>
                  <p className="text-neutral-600">Accommodating your schedule with various boarding options and durations.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-2 rounded-full mt-1">
                  <Heart className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Daily Updates</h3>
                  <p className="text-neutral-600">Regular photos and updates so you know your dog is happy and well-cared for.</p>
                </div>
              </div>
            </div>

            {/* Quote */}
            <div className="mt-8 p-6 bg-amber-50 rounded-xl border-l-4 border-amber-600">
              <blockquote className="italic text-neutral-700">
                &quot;Every dog deserves to feel loved and comfortable, even when their family is away. 
                That&apos;s the promise I make to every pet parent who trusts me with their furry friend.&quot;
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}