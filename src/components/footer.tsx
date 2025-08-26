import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, Calendar, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <Image
                src="/logo.jpg"
                alt="The Good Stay"
                width={60}
                height={60}
                className="rounded-lg"
              />
              <div>
                <h3 className="text-2xl font-playfair font-bold">
                  The Good Stay
                </h3>
                <p className="text-neutral-400">
                  Wholesome living made for the goodest lives
                </p>
              </div>
            </div>

            <p className="text-neutral-300 mb-6 max-w-md">
              Professional dog boarding and care services with personalized
              attention. Every dog deserves to feel loved and comfortable while
              their family is away.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-neutral-300">
                <Phone className="h-5 w-5 text-amber-400" />
                <span>(65) 9389 6862</span>
              </div>
              <div className="flex items-center space-x-3 text-neutral-300">
                <Mail className="h-5 w-5 text-amber-400" />
                <span>hello@thegoodstay.com</span>
              </div>
              <div className="flex items-center space-x-3 text-neutral-300">
                <MapPin className="h-5 w-5 text-amber-400" />
                <span>Singapore</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-neutral-300 hover:text-amber-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-neutral-300 hover:text-amber-400 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-neutral-300 hover:text-amber-400 transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-neutral-300 hover:text-amber-400 transition-colors"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-neutral-300 hover:text-amber-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Services</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/book-assessment"
                  className="text-neutral-300 hover:text-amber-400 transition-colors"
                >
                  Assessment Visits
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-neutral-300 hover:text-amber-400 transition-colors"
                >
                  Premium Treats & Accessories
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-playfair font-bold mb-4">
              Ready to Give Your Dog The Good Stay?
            </h3>
            <p className="text-amber-100 mb-6 max-w-2xl mx-auto">
              Start with a complimentary assessment visit to see if I'm the
              perfect match for your furry friend.
            </p>
            <Link
              href="/book-assessment"
              className="inline-flex items-center space-x-2 bg-white text-amber-600 px-8 py-3 rounded-full font-semibold hover:bg-neutral-100 transition-colors"
            >
              <Calendar className="h-5 w-5" />
              <span>Book Assessment Visit</span>
            </Link>
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-12 pt-8 border-t border-neutral-800 text-center">
          <div className="flex justify-center space-x-6 mb-6">
            <a
              href="#"
              className="bg-neutral-800 hover:bg-amber-600 p-3 rounded-full transition-colors duration-300"
              aria-label="Follow us on Instagram"
            >
              <Image
                src="/instagram.svg"
                alt="Instagram"
                width={20}
                height={20}
                className="invert"
              />
            </a>
          </div>

          <p className="text-neutral-400 text-sm">
            Follow @thegoodstay for daily updates and adorable photos of our
            furry guests!
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400 text-sm">
              © 2025 The Good Stay. All rights reserved. Made with{" "}
              <Heart className="inline h-4 w-4 text-red-500 mx-1" />
              for dogs everywhere.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-neutral-400 hover:text-amber-400 text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-neutral-400 hover:text-amber-400 text-sm transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
