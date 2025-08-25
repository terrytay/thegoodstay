import Link from 'next/link'
import { Calendar, Dog, Phone, Mail } from 'lucide-react'

export default function RecentBookings() {
  const bookings = [
    {
      id: '1',
      customerName: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '(555) 123-4567',
      dogName: 'Max',
      dogBreed: 'Golden Retriever',
      preferredDate: '2024-01-18',
      preferredTime: '10:00',
      status: 'pending',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      customerName: 'Michael Chen',
      email: 'michael@example.com',
      phone: '(555) 234-5678',
      dogName: 'Luna',
      dogBreed: 'Border Collie',
      preferredDate: '2024-01-19',
      preferredTime: '14:00',
      status: 'confirmed',
      createdAt: '2024-01-14'
    },
    {
      id: '3',
      customerName: 'Emily Rodriguez',
      email: 'emily@example.com',
      phone: '(555) 345-6789',
      dogName: 'Charlie',
      dogBreed: 'Mixed Breed',
      preferredDate: '2024-01-20',
      preferredTime: '15:00',
      status: 'pending',
      createdAt: '2024-01-14'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-neutral-100 text-neutral-800'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
      <div className="px-6 py-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Recent Assessment Bookings</h2>
          <Link
            href="/admin/bookings"
            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            View all
          </Link>
        </div>
      </div>

      <div className="divide-y divide-neutral-200">
        {bookings.map((booking) => (
          <div key={booking.id} className="p-6 hover:bg-neutral-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <Dog className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900">{booking.dogName}</h3>
                    <p className="text-sm text-neutral-500">{booking.dogBreed}</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-neutral-700 mb-2">Owner Information</h4>
                    <p className="text-sm text-neutral-900 mb-1">{booking.customerName}</p>
                    <div className="flex items-center space-x-2 text-sm text-neutral-600 mb-1">
                      <Mail className="h-3 w-3" />
                      <span>{booking.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-neutral-600">
                      <Phone className="h-3 w-3" />
                      <span>{booking.phone}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-neutral-700 mb-2">Appointment Details</h4>
                    <div className="flex items-center space-x-2 text-sm text-neutral-600 mb-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(booking.preferredDate).toLocaleDateString()}</span>
                      <span>at {booking.preferredTime}</span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Requested on {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex space-x-3">
                  {booking.status === 'pending' && (
                    <>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                        Confirm
                      </button>
                      <button className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors">
                        Contact
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}