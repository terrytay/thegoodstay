import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Unauthorized Access',
  description: 'Access denied',
  robots: {
    index: false,
    follow: false
  }
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-8">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">
          Access Denied
        </h1>
        <p className="text-xl text-neutral-600 mb-8 max-w-md mx-auto">
          You don&apos;t have permission to access this resource. Admin privileges are required.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            Go to Homepage
          </Link>
          
          <div>
            <Link
              href="/admin/login"
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}