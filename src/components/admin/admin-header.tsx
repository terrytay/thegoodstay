'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { useState } from 'react'

export default function AdminHeader() {
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button className="lg:hidden">
            <Menu className="h-6 w-6 text-neutral-600" />
          </button>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent w-64"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-neutral-200 z-10">
                <div className="p-4 border-b border-neutral-200">
                  <h3 className="font-semibold text-neutral-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 hover:bg-neutral-50 border-b border-neutral-100">
                    <p className="text-sm font-medium text-neutral-900">New booking request</p>
                    <p className="text-xs text-neutral-600 mt-1">Sarah Johnson requested an assessment visit</p>
                    <p className="text-xs text-neutral-400 mt-2">2 minutes ago</p>
                  </div>
                  <div className="p-4 hover:bg-neutral-50 border-b border-neutral-100">
                    <p className="text-sm font-medium text-neutral-900">Order completed</p>
                    <p className="text-xs text-neutral-600 mt-1">Order #1234 has been delivered</p>
                    <p className="text-xs text-neutral-400 mt-2">1 hour ago</p>
                  </div>
                  <div className="p-4 hover:bg-neutral-50">
                    <p className="text-sm font-medium text-neutral-900">Low stock alert</p>
                    <p className="text-xs text-neutral-600 mt-1">Premium Salmon Treats running low</p>
                    <p className="text-xs text-neutral-400 mt-2">3 hours ago</p>
                  </div>
                </div>
                <div className="p-4 border-t border-neutral-200">
                  <button className="text-amber-600 text-sm font-medium hover:text-amber-700">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center space-x-4 text-sm">
            <div className="text-center">
              <p className="text-neutral-600">Today&apos;s Orders</p>
              <p className="font-semibold text-neutral-900">12</p>
            </div>
            <div className="text-center">
              <p className="text-neutral-600">Revenue</p>
              <p className="font-semibold text-neutral-900">$340</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}