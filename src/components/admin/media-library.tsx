'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Search, Grid, List, Trash2, Copy, Check } from 'lucide-react'
import { getMediaLibrary, deleteImage } from '@/lib/storage'

interface MediaItem {
  id: string
  filename: string
  original_name: string
  file_path: string
  file_type: string
  file_size: number
  dimensions?: { width: number; height: number }
  alt_text?: string
  caption?: string
  folder: string
  created_at: string
}

interface MediaLibraryProps {
  onSelectImage?: (url: string) => void
  folder?: string
  selectionMode?: boolean
}

const MediaLibrary = ({ onSelectImage, folder, selectionMode = false }: MediaLibraryProps) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFolder, setSelectedFolder] = useState(folder || 'all')
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const fetchMediaItems = useCallback(async () => {
    try {
      setLoading(true)
      const items = await getMediaLibrary(
        selectedFolder === 'all' ? undefined : selectedFolder,
        100
      )
      setMediaItems(items)
    } catch (error) {
      console.error('Error fetching media items:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedFolder])

  useEffect(() => {
    fetchMediaItems()
  }, [fetchMediaItems])

  const filteredItems = mediaItems.filter(item =>
    item.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.alt_text?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const handleDeleteImage = async (item: MediaItem) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      await deleteImage(item.file_path)
      setMediaItems(prev => prev.filter(i => i.id !== item.id))
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Failed to delete image')
    }
  }

  const folders = [...new Set(mediaItems.map(item => item.folder))]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-64"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-square bg-neutral-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Media Library</h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-amber-100 text-amber-600' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-amber-100 text-amber-600' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Folder Filter */}
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="all">All Folders</option>
            {folders.map(folder => (
              <option key={folder} value={folder}>
                {folder}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-neutral-400 mb-4">
              <Grid className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-neutral-600">No images found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectionMode 
                    ? 'cursor-pointer hover:border-amber-400 hover:shadow-md' 
                    : 'border-neutral-200'
                }`}
                onClick={() => selectionMode && onSelectImage?.(item.file_path)}
              >
                <Image
                  src={item.file_path}
                  alt={item.alt_text || item.original_name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyUrl(item.file_path)
                        }}
                        className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                        title="Copy URL"
                      >
                        {copiedUrl === item.file_path ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-neutral-700" />
                        )}
                      </button>
                      
                      {!selectionMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteImage(item)
                          }}
                          className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2">
                  <p className="text-xs truncate">{item.original_name}</p>
                  <p className="text-xs opacity-80">
                    {item.dimensions && `${item.dimensions.width}×${item.dimensions.height} • `}
                    {formatFileSize(item.file_size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center space-x-4 p-3 rounded-lg border transition-all ${
                  selectionMode 
                    ? 'cursor-pointer hover:border-amber-400 hover:bg-amber-50' 
                    : 'border-neutral-200'
                }`}
                onClick={() => selectionMode && onSelectImage?.(item.file_path)}
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <Image
                    src={item.file_path}
                    alt={item.alt_text || item.original_name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 truncate">{item.original_name}</p>
                  <div className="flex items-center space-x-4 text-sm text-neutral-600 mt-1">
                    {item.dimensions && (
                      <span>{item.dimensions.width}×{item.dimensions.height}</span>
                    )}
                    <span>{formatFileSize(item.file_size)}</span>
                    <span className="capitalize">{item.folder}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopyUrl(item.file_path)
                    }}
                    className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                    title="Copy URL"
                  >
                    {copiedUrl === item.file_path ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-neutral-600" />
                    )}
                  </button>
                  
                  {!selectionMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteImage(item)
                      }}
                      className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MediaLibrary