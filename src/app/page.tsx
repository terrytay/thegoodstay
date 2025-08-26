"use client";

import { useState } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import LandingAnimation from "@/components/landing-animation";
import Link from "next/link";
import {
  Star,
  Calendar,
  Heart,
  Shield,
  User,
  Home,
  Camera,
  Check,
} from "lucide-react";
import homeData from "@/data/home.json";
import Image from "next/image";

export default function Page() {
  const [showLanding, setShowLanding] = useState(true);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "calendar":
        return Calendar;
      case "heart":
        return Heart;
      case "shield":
        return Shield;
      case "user":
        return User;
      case "home":
        return Home;
      case "camera":
        return Camera;
      case "check":
        return Check;
      default:
        return Shield;
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case "green":
        return "text-green-600";
      case "red":
        return "text-red-600";
      case "blue":
        return "text-blue-600";
      case "amber":
        return "text-amber-600";
      default:
        return "text-stone-600";
    }
  };

  return (
    <>
      {showLanding && (
        <LandingAnimation onAnimationComplete={() => setShowLanding(false)} />
      )}

      <div className="min-h-screen bg-stone-50">
        <Navigation />
        <main className="pt-20 md:pt-24">
          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-stone-100">
            {/* Decorative Elements */}
            {/* <div className="absolute top-20 left-10 w-32 h-32 border border-stone-300/30 rounded-full opacity-40"></div>
            <div className="absolute bottom-32 right-16 w-48 h-48 border border-stone-300/20 rounded-full opacity-30"></div>
            <div className="absolute top-1/3 right-20 w-2 h-2 bg-amber-800/20 rounded-full"></div>
            <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-stone-400/30 rounded-full"></div> */}
            <div className="relative z-20 max-w-4xl mx-auto px-8 lg:px-12 py-32 text-center">
              {/* Stats/Rating */}
              {/* <div className="mb-12">
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < Math.floor(homeData.stats.rating)
                            ? "fill-amber-600 text-amber-600"
                            : "fill-stone-300 text-stone-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-stone-700 tracking-wide">
                    {homeData.stats.text}
                  </span>
                </div>
              </div> */}

              {/* Title */}
              <h1 className="font-crimson text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal leading-[0.85] mb-8 md:mb-12 text-stone-900 max-w-6xl mx-auto">
                {homeData.hero.title}
              </h1>

              {/* Subtitle */}
              <p className="font-lora text-xl sm:text-2xl md:text-3xl text-stone-700 mb-16 md:mb-20 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
                {homeData.hero.subtitle}
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-12 mb-16 justify-center">
                {homeData.trustIndicators.map((indicator, index) => {
                  const Icon = getIcon(indicator.icon);
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-3 text-stone-600 hover:text-stone-800 transition-colors"
                    >
                      <div className="p-3 rounded-full bg-white shadow-sm">
                        <Icon
                          className={`h-6 w-6 ${getIconColor(indicator.color)}`}
                        />
                      </div>
                      <span className="text-sm font-medium tracking-wide font-lora">
                        {indicator.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center">
                {homeData.hero.ctaButtons.map((button, index) => (
                  <Link
                    key={index}
                    href={button.url}
                    className={`group inline-flex items-center justify-center px-12 sm:px-14 py-5 sm:py-6 text-lg font-medium transition-all duration-500 tracking-wide font-lora ${
                      button.style === "primary"
                        ? "bg-stone-800 text-amber-50 hover:bg-stone-700 hover:scale-[1.02] shadow-xl hover:shadow-2xl rounded-none"
                        : "border-2 border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-amber-50 rounded-none"
                    }`}
                  >
                    <span className="relative z-10">{button.text}</span>
                  </Link>
                ))}
              </div>
            </div>
            {/* Elegant scroll indicator
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="flex flex-col items-center space-y-4">
                <span className="text-xs font-light tracking-[0.4em] uppercase text-stone-600/70">
                  Discover More
                </span>
                <div className="w-px h-20 bg-gradient-to-b from-stone-500/40 to-transparent"></div>
              </div>
            </div> */}
          </section>

          {/* Why Choose Section */}
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-8 lg:px-12">
              {homeData.sections[0] && (
                <>
                  <div className="text-center mb-16">
                    <h2 className="font-crimson text-4xl md:text-5xl font-normal text-stone-900 mb-6">
                      {homeData.sections[0].title}
                    </h2>
                    <p className="font-lora text-lg text-stone-700 max-w-3xl mx-auto leading-relaxed">
                      {homeData.sections[0].subtitle}
                    </p>
                    <div className="w-24 h-px bg-amber-600 mx-auto mt-8"></div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {homeData.sections[0].features?.map((feature, index) => {
                  const Icon = getIcon(feature.icon);
                  return (
                    <div key={index} className="text-center">
                      <div className="p-4 rounded-full bg-amber-50 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <Icon className="h-8 w-8 text-amber-600" />
                      </div>
                      <h3 className="font-crimson text-xl font-normal text-stone-900 mb-4">
                        {feature.title}
                      </h3>
                      <p className="font-lora text-stone-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Promise Section */}
          <section className="py-24 bg-stone-50">
            <div className="max-w-7xl mx-auto px-8 lg:px-12">
              <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                {homeData.sections[1] && (
                  <div>
                    <h2 className="font-crimson text-4xl md:text-5xl font-normal text-stone-900 mb-8">
                      {homeData.sections[1].title}
                    </h2>
                    <p className="font-lora text-lg text-stone-700 leading-relaxed mb-12">
                      {homeData.sections[1].content}
                    </p>

                    <div className="space-y-8">
                      {homeData.sections[1].testimonials?.map(
                        (testimonial, index) => (
                          <div
                            key={index}
                            className="border-l-4 border-amber-600 pl-6"
                          >
                            <blockquote className="font-lora text-stone-700 italic mb-3">
                              &ldquo;{testimonial.quote}&rdquo;
                            </blockquote>
                            <cite className="font-lora text-sm text-stone-600 not-italic">
                              — {testimonial.author}, {testimonial.role}
                            </cite>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div className="lg:order-first">
                  <div className="aspect-[4/5] bg-stone-200 rounded-lg overflow-hidden"></div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 bg-amber-50">
            <div className="max-w-4xl mx-auto px-8 lg:px-12 text-center">
              <h2 className="font-crimson text-4xl md:text-5xl font-normal text-stone-900 mb-8">
                Ready to get started?
              </h2>
              <p className="font-lora text-lg text-stone-700 mb-12">
                Book your complimentary assessment visit today and see why
                families trust The Good Stay
              </p>
              <Link
                href="/book-assessment"
                className="inline-block bg-stone-800 text-amber-50 px-12 py-6 font-lora font-medium tracking-wide uppercase hover:bg-stone-700 transition-colors shadow-lg hover:shadow-xl rounded"
              >
                Book Assessment Visit
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
