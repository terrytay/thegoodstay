'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Save, ArrowLeft, Upload, X } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string
  stock_quantity: number
  is_active: boolean
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock_quantity: '',
    image_url: '',
    is_active: true
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const categories = [
    'Treats & Snacks',
    'Toys & Enrichment',
    'Accessories',
    'Health & Wellness',
    'Training & Behavior',
    'Grooming',
    'Other'
  ]

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) {
          console.error('Error fetching product:', error)
          router.push('/admin/products')
          return
        }

        setFormData({
          name: data.name,
          description: data.description || '',
          price: data.price.toString(),
          category: data.category,
          stock_quantity: data.stock_quantity.toString(),
          image_url: data.image_url || '',
          is_active: data.is_active
        })

        if (data.image_url) {
          setImagePreview(data.image_url)
        }
      } catch (err) {
        console.error('Error:', err)
        router.push('/admin/products')
      } finally {
        setInitialLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }

      setImageFile(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    setFormData(prev => ({ ...prev, image_url: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true)
      const supabase = createClient()

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file)

      if (error) {
        console.error('Error uploading image:', error)
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = formData.image_url

      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        } else {
          alert('Failed to upload image. Please try again.')
          setLoading(false)
          return
        }
      }

      const supabase = createClient()
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        image_url: imageUrl || null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', params.id)

      if (error) {
        throw error
      }

      router.push(`/admin/products/${params.id}`)
    } catch (err) {
      console.error('Error updating product:', err)
      alert('Error updating product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-neutral-200 rounded"></div>
            <div className="h-32 bg-neutral-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href={`/admin/products/${params.id}`}
            className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Product</span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Edit Product</h1>
        <p className="text-neutral-600">Update product information and settings</p>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-6">Basic Information</h3>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    placeholder="Describe the product..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-neutral-700 mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="stock_quantity" className="block text-sm font-medium text-neutral-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      id="stock_quantity"
                      name="stock_quantity"
                      required
                      min="0"
                      value={formData.stock_quantity}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-2">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Image */}
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-6">Product Image</h3>
              
              <div className="space-y-6">
                {/* Current Image */}
                {imagePreview && !imageFile && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Current Image
                    </label>
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Current product"
                        className="w-48 h-48 object-cover rounded-lg border border-neutral-300"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* New Image Upload */}
                {!imagePreview && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Upload New Image
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
                    >
                      <Upload className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                      <p className="text-sm text-neutral-600 mb-2">
                        Click to upload a new image
                      </p>
                      <p className="text-xs text-neutral-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                )}

                {/* Image Preview */}
                {imageFile && imagePreview && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      New Image Preview
                    </label>
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="New product preview"
                        className="w-48 h-48 object-cover rounded-lg border border-neutral-300"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {/* URL Input */}
                <div>
                  <label htmlFor="image_url" className="block text-sm font-medium text-neutral-700 mb-2">
                    Or use Image URL
                  </label>
                  <input
                    type="url"
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    disabled={!!imageFile}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-neutral-100 disabled:cursor-not-allowed"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-6">Settings</h3>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-neutral-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-neutral-700">
                  Active (visible in shop)
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-neutral-200">
            <Link
              href={`/admin/products/${params.id}`}
              className="px-6 py-3 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 disabled:bg-neutral-400 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>
                {uploading ? 'Uploading...' : loading ? 'Updating...' : 'Update Product'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}