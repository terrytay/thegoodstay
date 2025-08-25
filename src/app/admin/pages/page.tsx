'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Edit, Eye, Plus, Trash2, Globe, Clock } from 'lucide-react'

interface Page {
  id: string
  slug: string
  title: string
  meta_title?: string
  meta_description?: string
  status: string
  template: string
  created_at: string
  updated_at: string
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setPages(data || [])
    } catch (error) {
      console.error('Error fetching pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('cms_pages')
        .delete()
        .eq('id', pageId)

      if (error) throw error
      
      setPages(prev => prev.filter(page => page.id !== pageId))
    } catch (error) {
      console.error('Error deleting page:', error)
      alert('Failed to delete page')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-64"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Pages</h1>
          <p className="text-neutral-600">Manage your website pages and content</p>
        </div>
        
        <Link
          href="/admin/pages/new"
          className="flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Page</span>
        </Link>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {pages.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No pages yet</h3>
            <p className="text-neutral-600 mb-6">Create your first page to get started</p>
            <Link
              href="/admin/pages/new"
              className="inline-flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Page</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-neutral-900">Page</th>
                  <th className="text-left px-6 py-4 font-medium text-neutral-900">URL</th>
                  <th className="text-left px-6 py-4 font-medium text-neutral-900">Status</th>
                  <th className="text-left px-6 py-4 font-medium text-neutral-900">Template</th>
                  <th className="text-left px-6 py-4 font-medium text-neutral-900">Last Updated</th>
                  <th className="text-right px-6 py-4 font-medium text-neutral-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-neutral-900">
                          {page.title}
                        </div>
                        {page.meta_description && (
                          <div className="text-sm text-neutral-500 mt-1 max-w-md truncate">
                            {page.meta_description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-blue-600">
                        /{page.slug === 'home' ? '' : page.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(page.status)}`}>
                        {page.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-600 capitalize">
                        {page.template}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-neutral-600">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(page.updated_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/${page.slug === 'home' ? '' : page.slug}`}
                          target="_blank"
                          className="p-2 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View page"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/pages/${page.id}/edit`}
                          className="p-2 text-neutral-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit page"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeletePage(page.id)}
                          className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete page"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-neutral-900">
                {pages.filter(p => p.status === 'published').length}
              </p>
              <p className="text-sm text-neutral-600">Published Pages</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Edit className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-neutral-900">
                {pages.filter(p => p.status === 'draft').length}
              </p>
              <p className="text-sm text-neutral-600">Draft Pages</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center">
            <div className="bg-neutral-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-neutral-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-neutral-900">
                {pages.length}
              </p>
              <p className="text-sm text-neutral-600">Total Pages</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}