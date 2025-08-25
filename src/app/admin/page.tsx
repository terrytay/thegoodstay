import DashboardStats from '@/components/admin/dashboard-stats'
import RecentOrders from '@/components/admin/recent-orders'
import RecentBookings from '@/components/admin/recent-bookings'
import QuickActions from '@/components/admin/quick-actions'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-1">Welcome back! Here&apos;s what&apos;s happening with your business today.</p>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>

        {/* Quick Actions - Takes 1 column */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Recent Bookings */}
      <RecentBookings />
    </div>
  )
}