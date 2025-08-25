'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import CmsPage from '@/components/cms-page'
import { ArrowLeft, Save, Eye, Settings } from 'lucide-react'
import Link from 'next/link'

interface PageData {
  id: string
  slug: string
  title: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  featured_image_url?: string
  status: string
  template: string
}

export default function EditPagePage() {
  const params = useParams()
  const router = useRouter()
  const [pageData, setPageData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const pageId = params.id as string

  useEffect(() => {
    if (pageId) {
      fetchPageData()
    }
  }, [pageId])

  const fetchPageData = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .eq('id', pageId)
        .single()

      if (error) throw error
      setPageData(data)
    } catch (error) {
      console.error('Error fetching page data:', error)
      router.push('/admin/pages')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePageSettings = async (settings: Partial<PageData>) => {
    if (!pageData) return

    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('cms_pages')
        .update({
          title: settings.title || pageData.title,
          meta_title: settings.meta_title,
          meta_description: settings.meta_description,
          meta_keywords: settings.meta_keywords,
          status: settings.status || pageData.status,
        })
        .eq('id', pageId)

      if (error) throw error
      
      setPageData(prev => prev ? { ...prev, ...settings } : null)
      setShowSettings(false)
    } catch (error) {
      console.error('Error saving page settings:', error)
      alert('Failed to save page settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="animate-pulse">
          <div className="bg-white border-b border-neutral-200 p-4">
            <div className="h-8 bg-neutral-200 rounded w-64"></div>
          </div>
          <div className="p-8">
            <div className="h-96 bg-neutral-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!pageData) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Page Not Found</h1>
          <Link 
            href="/admin/pages"
            className="text-amber-600 hover:text-amber-700"
          >
            ← Back to Pages
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Editor Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/pages"
              className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Pages</span>
            </Link>
            
            <div className="border-l border-neutral-300 pl-4">
              <h1 className="font-semibold text-neutral-900">{pageData.title}</h1>
              <p className="text-sm text-neutral-600">/{pageData.slug}</p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                previewMode
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{previewMode ? 'Editing' : 'Preview'}</span>
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center space-x-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 text-sm rounded-full ${
                pageData.status === 'published' 
                  ? 'bg-green-100 text-green-800'
                  : pageData.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {pageData.status}
              </span>
              
              <Link
                href={`/${pageData.slug === 'home' ? '' : pageData.slug}`}
                target="_blank"
                className="flex items-center space-x-2 bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>View Live</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Page Editor */}
      <div className="relative">
        <CmsPage 
          slug={pageData.slug} 
          isEditing={!previewMode}
        />
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <PageSettingsModal
          pageData={pageData}
          onSave={handleSavePageSettings}
          onClose={() => setShowSettings(false)}
          saving={saving}
        />
      )}
    </div>
  )
}

// Page Settings Modal Component
interface PageSettingsModalProps {
  pageData: PageData
  onSave: (settings: Partial<PageData>) => void
  onClose: () => void
  saving: boolean
}

function PageSettingsModal({ pageData, onSave, onClose, saving }: PageSettingsModalProps) {
  const [settings, setSettings] = useState({
    title: pageData.title,
    meta_title: pageData.meta_title || '',
    meta_description: pageData.meta_description || '',
    meta_keywords: pageData.meta_keywords || '',
    status: pageData.status
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(settings)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">Page Settings</h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Basic Settings */}
            <div>
              <h3 className="font-medium text-neutral-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={settings.title}
                    onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Status
                  </label>
                  <select
                    value={settings.status}
                    onChange={(e) => setSettings(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div>
              <h3 className="font-medium text-neutral-900 mb-4">SEO Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Meta Title
                    <span className="text-xs text-neutral-500 ml-2">(60 chars recommended)</span>
                  </label>
                  <input
                    type="text"
                    value={settings.meta_title}
                    onChange={(e) => setSettings(prev => ({ ...prev, meta_title: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    maxLength={60}
                  />
                  <div className="text-xs text-neutral-500 mt-1">
                    {settings.meta_title.length}/60 characters
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Meta Description
                    <span className="text-xs text-neutral-500 ml-2">(160 chars recommended)</span>
                  </label>
                  <textarea
                    value={settings.meta_description}
                    onChange={(e) => setSettings(prev => ({ ...prev, meta_description: e.target.value }))}
                    rows={3}
                    maxLength={160}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  />
                  <div className="text-xs text-neutral-500 mt-1">
                    {settings.meta_description.length}/160 characters
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Meta Keywords
                    <span className="text-xs text-neutral-500 ml-2">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={settings.meta_keywords}
                    onChange={(e) => setSettings(prev => ({ ...prev, meta_keywords: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 disabled:bg-neutral-400 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}