import Link from 'next/link'
import { Plus, Package, Calendar, Users, BarChart3, Settings } from 'lucide-react'

export default function QuickActions() {
  const actions = [
    {
      name: 'Add Product',
      description: 'Add a new product to your shop',
      href: '/admin/products/new',
      icon: Plus,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      name: 'Manage Inventory',
      description: 'Update stock levels and pricing',
      href: '/admin/products',
      icon: Package,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'View Bookings',
      description: 'Review assessment requests',
      href: '/admin/bookings',
      icon: Calendar,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      name: 'Customer List',
      description: 'Manage customer relationships',
      href: '/admin/customers',
      icon: Users,
      color: 'bg-amber-500 hover:bg-amber-600'
    }
  ]

  const stats = [
    {
      name: 'Low Stock Items',
      value: '3',
      description: 'Items running low',
      href: '/admin/products?filter=low-stock',
      urgent: true
    },
    {
      name: 'Pending Bookings',
      value: '5',
      description: 'Awaiting confirmation',
      href: '/admin/bookings?status=pending',
      urgent: true
    },
    {
      name: 'This Week',
      value: '$1,240',
      description: 'Revenue so far',
      href: '/admin/analytics',
      urgent: false
    }
  ]

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
        <div className="space-y-3">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link
                key={index}
                href={action.href}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group"
              >
                <div className={`p-2 rounded-lg text-white ${action.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">{action.name}</p>
                  <p className="text-sm text-neutral-600">{action.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Important Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Attention Needed</h2>
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <Link
              key={index}
              href={stat.href}
              className="block p-4 rounded-lg border border-neutral-200 hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-700">{stat.name}</p>
                  <p className="text-xs text-neutral-500 mt-1">{stat.description}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    stat.urgent ? 'text-red-600' : 'text-neutral-900'
                  }`}>
                    {stat.value}
                  </p>
                  {stat.urgent && (
                    <div className="w-2 h-2 bg-red-500 rounded-full ml-auto mt-1"></div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Links</h2>
        <div className="space-y-2">
          <Link
            href="/admin/analytics"
            className="flex items-center space-x-2 text-neutral-600 hover:text-amber-600 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm">View Analytics</span>
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center space-x-2 text-neutral-600 hover:text-amber-600 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span className="text-sm">Settings</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="flex items-center space-x-2 text-neutral-600 hover:text-amber-600 transition-colors"
          >
            <span className="text-sm">View Website</span>
          </Link>
        </div>
      </div>
    </div>
  )
}