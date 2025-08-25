import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import CartItems from '@/components/shop/cart-items'
import { ShoppingBag } from 'lucide-react'

export default function CartPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        {/* Header */}
        <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-full shadow-lg">
                  <ShoppingBag className="h-12 w-12 text-amber-600" />
                </div>
              </div>
              
              <h1 className="font-playfair text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                Shopping Cart
              </h1>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Review your selected items and proceed to secure checkout.
              </p>
            </div>
          </div>
        </section>

        {/* Cart Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CartItems />
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}