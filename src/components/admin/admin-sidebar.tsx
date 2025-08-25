'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  ShoppingBag, 
  Package, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react'

export default function AdminSidebar() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="bg-neutral-900 text-white w-64 min-h-screen p-6">
      {/* Logo */}
      <Link href="/admin" className="flex items-center space-x-3 mb-8">
        <Image
          src="/logo.jpg"
          alt="The Good Stay"
          width={40}
          height={40}
          className="rounded-lg"
        />
        <div>
          <h1 className="font-playfair text-xl font-bold">The Good Stay</h1>
          <p className="text-neutral-400 text-sm">Admin Panel</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-amber-600 text-white'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="border-t border-neutral-800 pt-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">A</span>
            </div>
            <div>
              <p className="text-white font-medium">Admin</p>
              <p className="text-neutral-400 text-sm">Administrator</p>
            </div>
          </div>
          
          <button 
            onClick={async () => {
              const { createClient } = await import('@/lib/supabase/client')
              const supabase = createClient()
              await supabase.auth.signOut()
              window.location.href = '/admin/login'
            }}
            className="flex items-center space-x-3 text-neutral-300 hover:text-white transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}