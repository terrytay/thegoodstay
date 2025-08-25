'use client'

import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import CartItems from '@/components/shop/cart-items'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/cart-context'

export default function CartPage() {
  const { itemCount } = useCart()

  return (
    <div className="min-h-screen bg-stone-50">
      <Navigation />
      
      <main className="pt-20 md:pt-24">
        {/* Header */}
        <section className="bg-gradient-to-br from-amber-50 to-stone-100 py-16">
          <div className="max-w-4xl mx-auto px-8 lg:px-12 text-center">
            <h1 className="font-crimson text-4xl md:text-5xl font-normal text-stone-900 mb-4">
              Your Cart
            </h1>
            <p className="font-lora text-lg text-stone-600">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
        </section>

        {/* Cart Content */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-8 lg:px-12">
            <CartItems />
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}