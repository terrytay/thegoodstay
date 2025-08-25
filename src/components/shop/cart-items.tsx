"use client";

import { useState } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import {
  Minus,
  Plus,
  X,
  ShoppingBag,
  ArrowLeft,
  CreditCard,
} from "lucide-react";
import { useCart } from "@/context/cart-context";

export default function CartItems() {
  const { items, updateQuantity, removeItem, total, itemCount, clearCart } =
    useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);

    try {
      // Create checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image_url: item.image,
          })),
          shippingAddress: {
            name: "Customer Name", // This would come from a form in a real app
            email: "customer@example.com",
            line1: "123 Main St",
            city: "Anytown",
            state: "ST",
            postal_code: "12345",
            country: "US",
          },
        }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
      );

      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId,
        });

        if (error) {
          console.error("Stripe error:", error);
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const subtotal = total; // Convert from cents to dollars
  const shipping = 0; // No shipping fees for now
  const tax = 0; // No tax for now
  const finalTotal = subtotal;

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="h-24 w-24 text-stone-300 mx-auto mb-8" />
        <h2 className="font-crimson text-3xl font-normal text-stone-900 mb-4">
          Your cart is empty
        </h2>
        <p className="font-lora text-lg text-stone-600 mb-8 max-w-md mx-auto">
          Looks like you haven&apos;t added any items to your cart yet. Browse
          our premium selection of products.
        </p>

        <Link
          href="/shop"
          className="inline-flex items-center space-x-2 bg-stone-800 text-amber-50 px-8 py-4 font-lora font-medium tracking-wide uppercase hover:bg-stone-700 transition-colors rounded-lg shadow-lg hover:shadow-xl"
        >
          <ArrowLeft size={20} />
          <span>Continue Shopping</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <div className="space-y-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="group bg-stone-50 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg border border-stone-100"
            >
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Product Image */}
                <div className="w-full sm:w-32 h-32 bg-white rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-crimson text-xl font-normal text-stone-900">
                      {item.name}
                    </h3>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Price */}
                    <div className="font-lora text-lg font-semibold text-stone-900">
                      ${item.price.toFixed(2)}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-10 h-10 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center text-stone-600 hover:border-stone-800 hover:text-stone-800 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-lora font-medium text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-10 h-10 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center text-stone-600 hover:border-stone-800 hover:text-stone-800 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="font-lora text-lg font-semibold text-stone-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center space-x-2 bg-stone-100 text-stone-800 px-6 py-3 font-lora font-medium tracking-wide uppercase hover:bg-stone-200 transition-colors rounded-lg"
          >
            <ArrowLeft size={18} />
            <span>Continue Shopping</span>
          </Link>

          <button
            onClick={clearCart}
            className="inline-flex items-center justify-center space-x-2 bg-red-100 text-red-800 px-6 py-3 font-lora font-medium tracking-wide uppercase hover:bg-red-200 transition-colors rounded-lg"
          >
            <X size={18} />
            <span>Clear Cart</span>
          </button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-gradient-to-br from-amber-50 to-stone-100 rounded-2xl p-8 sticky top-32">
          <h2 className="font-crimson text-2xl font-normal text-stone-900 mb-6">
            Order Summary
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center font-lora">
              <span className="text-stone-600">
                Subtotal ({itemCount} items)
              </span>
              <span className="text-stone-900 font-medium">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            {shipping > 0 && (
              <div className="flex justify-between items-center font-lora">
                <span className="text-stone-600">Shipping</span>
                <span className="text-stone-900 font-medium">
                  ${shipping.toFixed(2)}
                </span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between items-center font-lora">
                <span className="text-stone-600">Tax</span>
                <span className="text-stone-900 font-medium">
                  ${tax.toFixed(2)}
                </span>
              </div>
            )}
            {(shipping > 0 || tax > 0) && (
              <div className="h-px bg-stone-200"></div>
            )}
            <div className="flex justify-between items-center font-lora text-lg font-semibold">
              <span className="text-stone-900">Total</span>
              <span className="text-stone-900">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="w-full bg-stone-800 text-amber-50 py-4 font-lora font-medium tracking-wide uppercase hover:bg-stone-700 transition-colors rounded-lg shadow-lg hover:shadow-xl mb-4 flex items-center justify-center space-x-2"
          >
            <CreditCard size={18} />
            <span>
              {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
            </span>
          </button>

          <div className="text-center">
            <p className="font-lora text-sm text-stone-500">
              Free shipping on all orders
            </p>
            <p className="font-lora text-xs text-stone-400 mt-2">
              Secure checkout powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
