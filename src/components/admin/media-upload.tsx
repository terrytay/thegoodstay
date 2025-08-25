'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Upload, Image as ImageIcon, X, Loader } from 'lucide-react'
import { uploadImage } from '@/lib/storage'

interface MediaUploadProps {
  onUploadComplete?: (url: string) => void
  folder?: string
  accept?: string
  maxSize?: number // in MB
  className?: string
}

const MediaUpload = ({ 
  onUploadComplete, 
  folder = 'general', 
  accept = 'image/*',
  maxSize = 10,
  className = ''
}: MediaUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return false
    }

    // Check file type
    if (accept === 'image/*' && !file.type.startsWith('image/')) {
      setError('Please select an image file')
      return false
    }

    return true
  }

  const handleFileUpload = async (file: File) => {
    if (!validateFile(file)) return

    setError(null)
    setUploading(true)

    try {
      // Create preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target?.result as string)
        reader.readAsDataURL(file)
      }

      const url = await uploadImage(file, folder)
      onUploadComplete?.(url)
      
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Upload failed')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const clearPreview = () => {
    setPreview(null)
    setError(null)
  }

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver
            ? 'border-amber-400 bg-amber-50'
            : uploading
            ? 'border-amber-300 bg-amber-25'
            : 'border-neutral-300 hover:border-neutral-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader className="w-12 h-12 text-amber-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-neutral-900 mb-2">Uploading...</p>
            <p className="text-sm text-neutral-600">Please wait while we upload your file</p>
          </div>
        ) : preview ? (
          <div className="relative">
            <div className="relative max-w-full max-h-64 mx-auto mb-4">
              <Image
                src={preview}
                alt="Preview"
                width={400}
                height={300}
                className="rounded-lg shadow-md object-contain"
                style={{ maxHeight: '16rem' }}
              />
            </div>
            <button
              onClick={clearPreview}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-sm text-green-600 font-medium">Upload completed successfully!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="bg-neutral-100 rounded-full p-4 mb-4">
              {accept === 'image/*' ? (
                <ImageIcon className="w-12 h-12 text-neutral-600" />
              ) : (
                <Upload className="w-12 h-12 text-neutral-600" />
              )}
            </div>
            <p className="text-lg font-medium text-neutral-900 mb-2">
              Drop your file here or click to browse
            </p>
            <p className="text-sm text-neutral-600 mb-4">
              {accept === 'image/*' ? 'Supports JPG, PNG, WebP, GIF' : 'Select a file to upload'}
            </p>
            <p className="text-xs text-neutral-500">
              Maximum file size: {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <X className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Success Actions */}
      {preview && !uploading && (
        <div className="mt-4 flex space-x-3">
          <button
            onClick={clearPreview}
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Upload Another
          </button>
        </div>
      )}
    </div>
  )
}

export default MediaUpload