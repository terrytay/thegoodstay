'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CreditCard } from 'lucide-react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url: string
  stock_quantity: number
}

export default function CartItems() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Premium Salmon Treats',
      price: 24.99,
      quantity: 2,
      image_url: '/placeholder-product.jpg',
      stock_quantity: 15
    },
    {
      id: '3',
      name: 'Organic Peanut Butter Biscuits',
      price: 18.99,
      quantity: 1,
      image_url: '/placeholder-product.jpg',
      stock_quantity: 22
    }
  ])
  
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCartItems(items => items.filter(item => item.id !== id))
      return
    }
    
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: Math.min(newQuantity, item.stock_quantity) } : item
      )
    )
  }

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id))
  }

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    
    try {
      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          shippingAddress: {
            name: 'Customer Name', // This would come from a form in a real app
            email: 'customer@example.com',
            line1: '123 Main St',
            city: 'Anytown',
            state: 'ST',
            postal_code: '12345',
            country: 'US'
          }
        }),
      })

      const { sessionId } = await response.json()

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId,
        })

        if (error) {
          console.error('Stripe error:', error)
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setIsCheckingOut(false)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 50 ? 0 : 8.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-neutral-100 p-8 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8">
          <ShoppingBag className="h-16 w-16 text-neutral-400" />
        </div>
        
        <h2 className="font-playfair text-3xl font-bold text-neutral-900 mb-4">
          Your cart is empty
        </h2>
        <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto">
          Looks like you haven&apos;t added any items to your cart yet. 
          Browse our premium selection of pet products.
        </p>
        
        <Link
          href="/shop"
          className="inline-flex items-center space-x-2 bg-amber-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-amber-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Continue Shopping</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-xl">Cart Items ({cartItems.length})</h2>
            <Link
              href="/shop"
              className="text-amber-600 hover:text-amber-700 flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>

          <div className="space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 pb-6 border-b border-neutral-200 last:border-b-0">
                {/* Product Image */}
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 text-xs">Product</span>
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900">{item.name}</h3>
                  <p className="text-neutral-600 text-sm">In stock: {item.stock_quantity}</p>
                  <p className="text-lg font-bold text-neutral-900 mt-1">
                    ${item.price.toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                    disabled={item.quantity >= item.stock_quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="font-semibold text-lg">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
          <h2 className="font-semibold text-xl mb-6">Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-neutral-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-neutral-600">Shipping</span>
              <span className="font-medium">
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-neutral-600">Tax</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          {shipping > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                Add ${(50 - subtotal).toFixed(2)} more for FREE shipping!
              </p>
            </div>
          )}

          {/* Checkout Button */}
          <button 
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="w-full bg-amber-600 text-white py-4 rounded-lg font-semibold hover:bg-amber-700 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <CreditCard className="h-5 w-5" />
            <span>{isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}</span>
          </button>

          {/* Security Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-neutral-500">
              Secure checkout powered by Stripe
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Your payment information is encrypted and secure
            </p>
          </div>

          {/* Accepted Payment Methods */}
          <div className="mt-4 text-center">
            <p className="text-xs text-neutral-500 mb-2">We accept</p>
            <div className="flex justify-center space-x-2">
              <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-800 rounded text-white text-xs flex items-center justify-center">
                VISA
              </div>
              <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-yellow-500 rounded text-white text-xs flex items-center justify-center">
                MC
              </div>
              <div className="w-8 h-5 bg-gradient-to-r from-blue-500 to-blue-700 rounded text-white text-xs flex items-center justify-center">
                AMEX
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}