import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      redirect('/admin-login')
    }

    // Check if user has admin role - use raw_user_meta_data
    const userRole = user.user_metadata?.role || user.app_metadata?.role || 
                    (user as { raw_user_meta_data?: { role?: string } }).raw_user_meta_data?.role
    
    if (userRole !== 'admin') {
      redirect('/unauthorized')
    }

    return user
  } catch (error) {
    console.error('Admin auth error:', error)
    redirect('/admin-login')
  }
}

export async function isAdmin() {
  const supabase = await createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false

    const userRole = user.user_metadata?.role || user.app_metadata?.role
    return userRole === 'admin'
  } catch {
    return false
  }
}