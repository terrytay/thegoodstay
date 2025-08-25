'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ShoppingBag, Calendar } from 'lucide-react'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.jpg"
              alt="The Good Stay"
              width={60}
              height={60}
              className="rounded-lg"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-neutral-700 hover:text-neutral-900 transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-neutral-700 hover:text-neutral-900 transition-colors">
              About
            </Link>
            <Link href="/services" className="text-neutral-700 hover:text-neutral-900 transition-colors">
              Services
            </Link>
            <Link href="/shop" className="text-neutral-700 hover:text-neutral-900 transition-colors">
              Shop
            </Link>
            <Link href="/contact" className="text-neutral-700 hover:text-neutral-900 transition-colors">
              Contact
            </Link>
            
            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/book-assessment"
                className="flex items-center space-x-2 bg-amber-100 text-amber-900 px-4 py-2 rounded-full hover:bg-amber-200 transition-colors"
              >
                <Calendar size={16} />
                <span>Book Assessment</span>
              </Link>
              
              <Link 
                href="/shop/cart"
                className="flex items-center space-x-2 text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <ShoppingBag size={20} />
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-neutral-700 hover:text-neutral-900"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-neutral-100">
              <Link 
                href="/"
                className="block px-3 py-2 text-neutral-700 hover:text-neutral-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/about"
                className="block px-3 py-2 text-neutral-700 hover:text-neutral-900"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/services"
                className="block px-3 py-2 text-neutral-700 hover:text-neutral-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="/shop"
                className="block px-3 py-2 text-neutral-700 hover:text-neutral-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              <Link 
                href="/contact"
                className="block px-3 py-2 text-neutral-700 hover:text-neutral-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="px-3 py-2">
                <Link 
                  href="/book-assessment"
                  className="flex items-center justify-center space-x-2 bg-amber-100 text-amber-900 px-4 py-2 rounded-full hover:bg-amber-200 transition-colors w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Calendar size={16} />
                  <span>Book Assessment</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}