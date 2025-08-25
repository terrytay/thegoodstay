'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import Image from 'next/image'

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      name: 'Sarah Johnson',
      dogName: 'Max',
      rating: 5,
      text: 'I was nervous about leaving Max for the first time, but the assessment visit put me completely at ease. She truly cares about every dog and treats them like family. Max came home happy and relaxed!',
      image: '/testimonial1.jpg'
    },
    {
      name: 'Michael Chen',
      dogName: 'Luna',
      rating: 5,
      text: 'The daily photo updates were amazing! I could see Luna playing and having the time of her life. The personalized care and attention to Luna\'s specific needs was exceptional.',
      image: '/testimonial2.jpg'
    },
    {
      name: 'Emily Rodriguez',
      dogName: 'Charlie',
      rating: 5,
      text: 'Finding reliable pet care is challenging, but The Good Stay exceeded all expectations. Charlie is usually anxious with new people, but he took to her immediately. Highly recommended!',
      image: '/testimonial3.jpg'
    },
    {
      name: 'David Thompson',
      dogName: 'Bella',
      rating: 5,
      text: 'Professional, caring, and trustworthy. The assessment process showed how much she cares about matching the right dogs with her services. Bella has stayed multiple times and loves it!',
      image: '/testimonial4.jpg'
    }
  ]

  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }, [testimonials.length])

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000)
    return () => clearInterval(interval)
  }, [nextTestimonial])

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
            Happy Families & Wagging Tails
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Don&apos;t just take our word for it - hear from the pet parents who trust us with their beloved companions.
          </p>
        </div>

        {/* Main Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
              <Quote className="w-full h-full text-amber-600" />
            </div>

            <div className="relative z-10">
              {/* Stars */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center space-x-1">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-lg md:text-xl text-neutral-700 text-center mb-8 leading-relaxed">
                &quot;{testimonials[currentIndex].text}&quot;
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <p className="font-semibold text-neutral-900 text-lg">
                    {testimonials[currentIndex].name}
                  </p>
                  <p className="text-neutral-600">
                    {testimonials[currentIndex].dogName}&apos;s Parent
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5 text-neutral-600" />
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5 text-neutral-600" />
            </button>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-amber-600 scale-125'
                    : 'bg-neutral-300 hover:bg-neutral-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-white rounded-2xl p-8 md:p-12 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-amber-600 mb-2">200+</p>
              <p className="text-neutral-600 font-medium">Happy Dogs</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-amber-600 mb-2">5</p>
              <p className="text-neutral-600 font-medium">Years Experience</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-amber-600 mb-2">98%</p>
              <p className="text-neutral-600 font-medium">Satisfaction Rate</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-amber-600 mb-2">24/7</p>
              <p className="text-neutral-600 font-medium">Care & Attention</p>
            </div>
          </div>
        </div>

        {/* Instagram Integration */}
        <div className="mt-16 text-center">
          <h3 className="font-playfair text-2xl md:text-3xl font-bold text-neutral-900 mb-6">
            Follow Our Adventures
          </h3>
          <p className="text-neutral-600 mb-8">
            See daily photos and videos of happy dogs on our Instagram
          </p>
          <a
            href="#"
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Image
              src="/instagram.svg"
              alt="Instagram"
              width={24}
              height={24}
              className="invert"
            />
            <span>@thegoodstay</span>
          </a>
        </div>
      </div>
    </section>
  )
}