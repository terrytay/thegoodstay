"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/cart-context";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <>
      <nav className="fixed top-0 w-full bg-amber-50/98 backdrop-blur-md z-40 border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 md:h-24">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 z-50 relative">
              <div className="flex items-center space-x-3">
                {/* <Image
                  src="/logo.jpg"
                  alt="The Good Stay"
                  width={50}
                  height={50}
                  className="rounded-lg"
                /> */}
                <div className="font-crimson text-2xl md:text-3xl font-semibold text-stone-800 tracking-wide">
                  THE GOOD STAY
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-16">
              <Link
                href="/"
                className="text-stone-700 hover:text-stone-900 transition-colors font-medium tracking-[0.1em] font-lora text-sm uppercase"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-stone-700 hover:text-stone-900 transition-colors font-medium tracking-[0.1em] font-lora text-sm uppercase"
              >
                About
              </Link>
              <Link
                href="/services"
                className="text-stone-700 hover:text-stone-900 transition-colors font-medium tracking-[0.1em] font-lora text-sm uppercase"
              >
                Services
              </Link>
              <Link
                href="/shop"
                className="text-stone-700 hover:text-stone-900 transition-colors font-medium tracking-[0.1em] font-lora text-sm uppercase"
              >
                Shop
              </Link>
              <Link
                href="/contact"
                className="text-stone-700 hover:text-stone-900 transition-colors font-medium tracking-[0.1em] font-lora text-sm uppercase"
              >
                Contact
              </Link>

              {/* CTA Buttons */}
              <div className="flex items-center space-x-6 ml-12">
                <Link
                  href="/book-assessment"
                  className="bg-stone-800 text-amber-50 px-8 py-3 hover:bg-stone-700 transition-colors font-medium tracking-wide text-sm font-lora uppercase shadow-lg hover:shadow-xl"
                >
                  Book Now
                </Link>

                <Link
                  href="/shop/cart"
                  className="text-neutral-700 hover:text-neutral-900 transition-colors relative"
                >
                  <ShoppingBag size={20} />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Mobile cart and menu buttons */}
            <div className="md:hidden flex items-center space-x-4">
              <Link
                href="/shop/cart"
                className="text-neutral-700 hover:text-neutral-900 transition-colors relative"
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-neutral-700 hover:text-neutral-900 z-50 relative"
              >
                {isMenuOpen ? (
                  <X size={24} color="white" />
                ) : (
                  <Menu size={24} />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close button */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-6 right-6 text-white hover:text-gray-200"
            >
              <X size={32} />
            </button>

            {/* Logo */}
            <motion.div
              className="absolute top-6 left-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center space-x-2">
                <Image
                  src="/logo.jpg"
                  alt="The Good Stay"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <div className="font-crimson text-xl font-bold text-white">
                  THE GOOD STAY
                </div>
              </div>
            </motion.div>

            {/* Tagline */}
            {/* <motion.h2
              className="font-playfair text-white text-3xl md:text-5xl font-light mb-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Wholesome living made for the goodest lives
            </motion.h2> */}

            {/* Navigation Links */}
            <motion.nav
              className="space-y-6 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {[
                { href: "/", label: "HOME" },
                { href: "/about", label: "OUR STORY" },
                { href: "/services", label: "SERVICES" },
                { href: "/shop", label: "SHOP" },
                { href: "/contact", label: "CONTACT" },
              ].map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="block text-white text-2xl font-light tracking-widest hover:text-yellow-200 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            {/* CTA Button */}
            <motion.div
              className="mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Link
                href="/book-assessment"
                className="inline-block bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                BOOK ASSESSMENT
              </Link>
            </motion.div>

            {/* Social Links */}
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 space-y-2 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              <div className="text-white text-sm tracking-wider">FACEBOOK</div>
              <div className="text-white text-sm tracking-wider">INSTAGRAM</div>
              <div className="text-white text-sm tracking-wider">REVIEWS</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
