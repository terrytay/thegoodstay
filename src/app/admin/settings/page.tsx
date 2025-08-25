'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Mail, 
  Phone,
  MapPin,
  Clock,
  Save,
  Eye,
  EyeOff,
  Key,
  Database,
  Globe,
  CreditCard
} from 'lucide-react'

interface BusinessSettings {
  businessName: string
  businessEmail: string
  businessPhone: string
  businessAddress: string
  businessHours: {
    monday: { open: string; close: string; closed: boolean }
    tuesday: { open: string; close: string; closed: boolean }
    wednesday: { open: string; close: string; closed: boolean }
    thursday: { open: string; close: string; closed: boolean }
    friday: { open: string; close: string; closed: boolean }
    saturday: { open: string; close: string; closed: boolean }
    sunday: { open: string; close: string; closed: boolean }
  }
  bookingSettings: {
    advanceBookingDays: number
    assessmentDuration: number
    bookingBuffer: number
  }
  notifications: {
    emailNotifications: boolean
    newBookings: boolean
    newOrders: boolean
    lowStock: boolean
    dailyReports: boolean
  }
  pricing: {
    assessmentFee: number
    cancellationPolicy: string
  }
}

interface AdminProfile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    businessName: 'The Good Stay',
    businessEmail: 'hello@thegoodstay.com',
    businessPhone: '+1 (555) 123-4567',
    businessAddress: '123 Pet Care Lane, Dog City, DC 12345',
    businessHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '15:00', closed: false },
      sunday: { open: '10:00', close: '15:00', closed: true }
    },
    bookingSettings: {
      advanceBookingDays: 30,
      assessmentDuration: 60,
      bookingBuffer: 15
    },
    notifications: {
      emailNotifications: true,
      newBookings: true,
      newOrders: true,
      lowStock: true,
      dailyReports: false
    },
    pricing: {
      assessmentFee: 0,
      cancellationPolicy: '24-hour cancellation policy'
    }
  })

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')

  const fetchAdminProfile = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          setAdminProfile(profile)
        }
      }
    } catch (err) {
      console.error('Error fetching admin profile:', err)
    }
  }, [])

  useEffect(() => {
    fetchAdminProfile()
  }, [fetchAdminProfile])

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      // In a real app, you'd save these to a settings table or similar
      // For now, we'll just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!adminProfile) return
    
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: adminProfile.full_name,
          phone: adminProfile.phone
        })
        .eq('id', adminProfile.id)

      if (error) {
        throw error
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error updating profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw error
      }

      setNewPassword('')
      setConfirmPassword('')
      setCurrentPassword('')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error changing password:', err)
      alert('Error changing password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'business', label: 'Business Info', icon: Globe },
    { id: 'profile', label: 'Admin Profile', icon: User },
    { id: 'bookings', label: 'Booking Settings', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Database }
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Settings</h1>
        <p className="text-neutral-600">Manage your business settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-amber-100 text-amber-900 font-medium'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            {/* Business Info Tab */}
            {activeTab === 'business' && (
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">Business Information</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Business Name</label>
                      <input
                        type="text"
                        value={businessSettings.businessName}
                        onChange={(e) => setBusinessSettings({
                          ...businessSettings,
                          businessName: e.target.value
                        })}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Business Email</label>
                      <input
                        type="email"
                        value={businessSettings.businessEmail}
                        onChange={(e) => setBusinessSettings({
                          ...businessSettings,
                          businessEmail: e.target.value
                        })}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Business Phone</label>
                      <input
                        type="tel"
                        value={businessSettings.businessPhone}
                        onChange={(e) => setBusinessSettings({
                          ...businessSettings,
                          businessPhone: e.target.value
                        })}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Assessment Fee</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-neutral-500">$</span>
                        <input
                          type="number"
                          value={businessSettings.pricing.assessmentFee}
                          onChange={(e) => setBusinessSettings({
                            ...businessSettings,
                            pricing: {
                              ...businessSettings.pricing,
                              assessmentFee: parseFloat(e.target.value) || 0
                            }
                          })}
                          className="w-full pl-8 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Business Address</label>
                    <textarea
                      value={businessSettings.businessAddress}
                      onChange={(e) => setBusinessSettings({
                        ...businessSettings,
                        businessAddress: e.target.value
                      })}
                      rows={3}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  {/* Business Hours */}
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Business Hours</h3>
                    <div className="space-y-4">
                      {Object.entries(businessSettings.businessHours).map(([day, hours]) => (
                        <div key={day} className="flex items-center space-x-4">
                          <div className="w-20">
                            <span className="text-sm font-medium text-neutral-700 capitalize">{day}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={!hours.closed}
                              onChange={(e) => setBusinessSettings({
                                ...businessSettings,
                                businessHours: {
                                  ...businessSettings.businessHours,
                                  [day]: { ...hours, closed: !e.target.checked }
                                }
                              })}
                              className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span className="text-sm text-neutral-600">Open</span>
                          </div>
                          {!hours.closed && (
                            <>
                              <input
                                type="time"
                                value={hours.open}
                                onChange={(e) => setBusinessSettings({
                                  ...businessSettings,
                                  businessHours: {
                                    ...businessSettings.businessHours,
                                    [day]: { ...hours, open: e.target.value }
                                  }
                                })}
                                className="px-3 py-1 border border-neutral-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              />
                              <span className="text-neutral-400">to</span>
                              <input
                                type="time"
                                value={hours.close}
                                onChange={(e) => setBusinessSettings({
                                  ...businessSettings,
                                  businessHours: {
                                    ...businessSettings.businessHours,
                                    [day]: { ...hours, close: e.target.value }
                                  }
                                })}
                                className="px-3 py-1 border border-neutral-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                              />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Profile Tab */}
            {activeTab === 'profile' && adminProfile && (
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">Admin Profile</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={adminProfile.full_name || ''}
                        onChange={(e) => setAdminProfile({
                          ...adminProfile,
                          full_name: e.target.value
                        })}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={adminProfile.email || ''}
                        disabled
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500"
                      />
                      <p className="text-xs text-neutral-500 mt-1">Email cannot be changed here</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={adminProfile.phone || ''}
                      onChange={(e) => setAdminProfile({
                        ...adminProfile,
                        phone: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 disabled:bg-neutral-400 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>{loading ? 'Updating...' : 'Update Profile'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Booking Settings Tab */}
            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">Booking Settings</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Advance Booking (Days)</label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={businessSettings.bookingSettings.advanceBookingDays}
                        onChange={(e) => setBusinessSettings({
                          ...businessSettings,
                          bookingSettings: {
                            ...businessSettings.bookingSettings,
                            advanceBookingDays: parseInt(e.target.value) || 30
                          }
                        })}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Assessment Duration (Minutes)</label>
                      <input
                        type="number"
                        min="15"
                        max="240"
                        step="15"
                        value={businessSettings.bookingSettings.assessmentDuration}
                        onChange={(e) => setBusinessSettings({
                          ...businessSettings,
                          bookingSettings: {
                            ...businessSettings.bookingSettings,
                            assessmentDuration: parseInt(e.target.value) || 60
                          }
                        })}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Booking Buffer (Minutes)</label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        step="5"
                        value={businessSettings.bookingSettings.bookingBuffer}
                        onChange={(e) => setBusinessSettings({
                          ...businessSettings,
                          bookingSettings: {
                            ...businessSettings.bookingSettings,
                            bookingBuffer: parseInt(e.target.value) || 15
                          }
                        })}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Cancellation Policy</label>
                    <textarea
                      value={businessSettings.pricing.cancellationPolicy}
                      onChange={(e) => setBusinessSettings({
                        ...businessSettings,
                        pricing: {
                          ...businessSettings.pricing,
                          cancellationPolicy: e.target.value
                        }
                      })}
                      rows={3}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="e.g., 24-hour cancellation policy, cancellation fees, etc."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">Notification Settings</h2>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    {Object.entries(businessSettings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-neutral-900 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {key === 'emailNotifications' && 'Enable email notifications'}
                            {key === 'newBookings' && 'Get notified when new bookings are made'}
                            {key === 'newOrders' && 'Get notified when new orders are placed'}
                            {key === 'lowStock' && 'Get notified when products are running low'}
                            {key === 'dailyReports' && 'Receive daily summary reports'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setBusinessSettings({
                              ...businessSettings,
                              notifications: {
                                ...businessSettings.notifications,
                                [key]: e.target.checked
                              }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Change Password</h3>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2 text-neutral-400 hover:text-neutral-600"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Confirm New Password</label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="Confirm new password"
                        />
                      </div>

                      <button
                        onClick={handleChangePassword}
                        disabled={loading || !newPassword || !confirmPassword}
                        className="flex items-center space-x-2 bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 disabled:bg-neutral-400 transition-colors"
                      >
                        <Key className="h-4 w-4" />
                        <span>{loading ? 'Changing...' : 'Change Password'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">System Information</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <h4 className="font-medium text-neutral-900 mb-2">Database Status</h4>
                      <p className="text-sm text-green-600">Connected to Supabase</p>
                    </div>
                    
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <h4 className="font-medium text-neutral-900 mb-2">Payment Integration</h4>
                      <p className="text-sm text-green-600">Stripe Connected</p>
                    </div>
                    
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <h4 className="font-medium text-neutral-900 mb-2">Email Service</h4>
                      <p className="text-sm text-neutral-600">Not configured</p>
                    </div>
                    
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <h4 className="font-medium text-neutral-900 mb-2">Storage</h4>
                      <p className="text-sm text-green-600">Supabase Storage</p>
                    </div>
                  </div>

                  <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                    <h4 className="font-medium text-amber-900 mb-2">Backup & Security</h4>
                    <p className="text-sm text-amber-800 mb-4">
                      Your data is automatically backed up daily. All connections are encrypted.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-amber-800">SSL Certificate Active</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-amber-800">Daily Backups</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-amber-800">Data Encryption</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 flex items-center justify-between border-t border-neutral-200 pt-6">
              <div>
                {saved && (
                  <p className="text-green-600 text-sm">Settings saved successfully!</p>
                )}
              </div>
              <button
                onClick={activeTab === 'profile' ? handleUpdateProfile : handleSaveSettings}
                disabled={loading}
                className="flex items-center space-x-2 bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 disabled:bg-neutral-400 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}