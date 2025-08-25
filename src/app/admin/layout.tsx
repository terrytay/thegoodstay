import AdminSidebar from '@/components/admin/admin-sidebar'
import AdminHeader from '@/components/admin/admin-header'
import { requireAdmin } from '@/lib/auth/admin'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This will redirect to login if not authenticated as admin
  await requireAdmin()

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar - Fixed */}
      <div className="fixed left-0 top-0 z-40">
        <AdminSidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header - Fixed */}
        <div className="fixed top-0 right-0 z-30" style={{ left: '256px' }}>
          <AdminHeader />
        </div>
        
        {/* Content Area */}
        <main className="pt-20 flex-1">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}