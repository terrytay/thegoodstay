'use client'

import { useState, useEffect } from 'react'
import { X, Save, Eye, Settings } from 'lucide-react'

interface BlockEditorModalProps {
  isOpen: boolean
  onClose: () => void
  blockType: string
  blockData: any
  onSave: (data: any) => void
}

export default function BlockEditorModal({
  isOpen,
  onClose,
  blockType,
  blockData,
  onSave
}: BlockEditorModalProps) {
  const [data, setData] = useState(blockData || {})
  const [activeTab, setActiveTab] = useState('content')

  useEffect(() => {
    setData(blockData || {})
  }, [blockData])

  const handleSave = () => {
    onSave(data)
    onClose()
  }

  if (!isOpen) return null

  const renderContentTab = () => {
    switch (blockType) {
      case 'text':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (optional)
              </label>
              <input
                type="text"
                value={data.title || ''}
                onChange={(e) => setData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={data.content || ''}
                onChange={(e) => setData(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter your content here..."
              />
              <p className="text-xs text-gray-500 mt-1">HTML tags are supported</p>
            </div>
          </div>
        )
      
      case 'hero':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Title
              </label>
              <input
                type="text"
                value={data.title || ''}
                onChange={(e) => setData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Your amazing title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <textarea
                value={data.subtitle || ''}
                onChange={(e) => setData(prev => ({ ...prev, subtitle: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Supporting description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Image URL (optional)
              </label>
              <input
                type="url"
                value={data.backgroundImage || ''}
                onChange={(e) => setData(prev => ({ ...prev, backgroundImage: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">No editor available for this block type yet.</p>
          </div>
        )
    }
  }

  const renderStyleTab = () => {
    switch (blockType) {
      case 'text':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Alignment
              </label>
              <select
                value={data.textAlign || 'left'}
                onChange={(e) => setData(prev => ({ ...prev, textAlign: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Width
              </label>
              <select
                value={data.maxWidth || 'lg'}
                onChange={(e) => setData(prev => ({ ...prev, maxWidth: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="sm">Small (768px)</option>
                <option value="md">Medium (1024px)</option>
                <option value="lg">Large (1280px)</option>
                <option value="xl">Extra Large (1536px)</option>
                <option value="full">Full Width</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Padding
              </label>
              <select
                value={data.padding || 'lg'}
                onChange={(e) => setData(prev => ({ ...prev, padding: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </div>
          </div>
        )
      
      case 'hero':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={data.theme || 'light'}
                onChange={(e) => setData(prev => ({ ...prev, theme: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="overlay"
                checked={data.overlay || false}
                onChange={(e) => setData(prev => ({ ...prev, overlay: e.target.checked }))}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="overlay" className="ml-2 block text-sm text-gray-900">
                Add dark overlay to background image
              </label>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">No style options available for this block type.</p>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Edit {blockType.charAt(0).toUpperCase() + blockType.slice(1)} Block
            </h2>
            <p className="text-sm text-gray-500">Customize your content and styling</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-3 border-b-2 font-medium text-sm ${
                activeTab === 'content'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Content
            </button>
            <button
              onClick={() => setActiveTab('style')}
              className={`py-3 border-b-2 font-medium text-sm ${
                activeTab === 'style'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Style
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'content' ? renderContentTab() : renderStyleTab()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  )
}