import { TrendingUp, TrendingDown, ShoppingBag, Calendar, Users, DollarSign } from 'lucide-react'

export default function DashboardStats() {
  const stats = [
    {
      name: 'Total Revenue',
      value: '$12,426',
      change: '+12%',
      changeType: 'increase',
      icon: DollarSign,
      period: 'this month'
    },
    {
      name: 'Orders',
      value: '156',
      change: '+8%',
      changeType: 'increase',
      icon: ShoppingBag,
      period: 'this month'
    },
    {
      name: 'Bookings',
      value: '23',
      change: '+15%',
      changeType: 'increase',
      icon: Calendar,
      period: 'this month'
    },
    {
      name: 'Customers',
      value: '89',
      change: '+5%',
      changeType: 'increase',
      icon: Users,
      period: 'this month'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">{stat.name}</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">{stat.value}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <Icon className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            
            <div className="mt-4 flex items-center">
              <div className={`flex items-center space-x-1 ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.changeType === 'increase' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{stat.change}</span>
              </div>
              <span className="text-neutral-600 text-sm ml-2">{stat.period}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}