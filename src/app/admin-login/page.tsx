import AdminLoginForm from '@/components/admin/admin-login-form'
import Image from 'next/image'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Login',
  description: 'Login to The Good Stay admin dashboard',
  robots: {
    index: false,
    follow: false
  }
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.jpg"
                alt="The Good Stay"
                width={80}
                height={80}
                className="rounded-lg"
              />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Admin Login</h1>
            <p className="text-neutral-600">Access your dashboard</p>
          </div>

          {/* Login Form */}
          <AdminLoginForm />
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-neutral-500 text-sm">
            © 2024 The Good Stay. Admin Access Only.
          </p>
        </div>
      </div>
    </div>
  )
}