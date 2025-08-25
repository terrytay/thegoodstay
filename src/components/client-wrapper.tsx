'use client'

import { ReactNode } from 'react'
import { CartProvider } from '@/context/cart-context'

interface ClientWrapperProps {
  children: ReactNode
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  )
}