'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Eye, EyeOff, Package, DollarSign, Calendar } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string
  stock_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

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

        setProduct(data)
      } catch (err) {
        console.error('Error:', err)
        router.push('/admin/products')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, router])

  const toggleProductStatus = async () => {
    if (!product) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id)

      if (error) {
        console.error('Error updating product status:', error)
        return
      }

      setProduct(prev => prev ? { ...prev, is_active: !prev.is_active } : null)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const deleteProduct = async () => {
    if (!product) return

    if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      try {
        const supabase = createClient()
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', product.id)

        if (error) {
          console.error('Error deleting product:', error)
          return
        }

        router.push('/admin/products')
      } catch (err) {
        console.error('Error:', err)
      }
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-neutral-200 rounded"></div>
              <div className="h-32 bg-neutral-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-neutral-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <h2 className="text-xl font-medium text-neutral-900 mb-2">Product Not Found</h2>
          <p className="text-neutral-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link
            href="/admin/products"
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' }
    if (quantity <= 5) return { label: 'Low Stock', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { label: 'In Stock', color: 'text-green-600', bg: 'bg-green-100' }
  }

  const stockStatus = getStockStatus(product.stock_quantity)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/products"
            className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Products</span>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleProductStatus}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              product.is_active
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {product.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span>{product.is_active ? 'Active' : 'Inactive'}</span>
          </button>
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Link>
          <button
            onClick={deleteProduct}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Image */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-medium text-neutral-900 mb-4">Product Image</h2>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg border border-neutral-300"
              />
            ) : (
              <div className="w-full h-64 bg-neutral-100 rounded-lg border border-neutral-300 flex items-center justify-center">
                <span className="text-neutral-500">No image available</span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-medium text-neutral-900 mb-4">Product Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-neutral-900">{product.name}</h3>
                <p className="text-neutral-600 mt-2">{product.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
                <div>
                  <p className="text-sm text-neutral-500">Category</p>
                  <p className="font-medium text-neutral-900">{product.category}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Created</p>
                  <p className="font-medium text-neutral-900">
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-8 w-8 text-green-600 bg-green-100 rounded-lg p-2" />
                <div>
                  <p className="text-sm text-neutral-500">Price</p>
                  <p className="text-xl font-bold text-neutral-900">${product.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Package className="h-8 w-8 text-blue-600 bg-blue-100 rounded-lg p-2" />
                <div>
                  <p className="text-sm text-neutral-500">Stock</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-xl font-bold text-neutral-900">{product.stock_quantity}</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                      {stockStatus.label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-8 w-8 text-purple-600 bg-purple-100 rounded-lg p-2" />
                <div>
                  <p className="text-sm text-neutral-500">Status</p>
                  <p className={`text-lg font-semibold ${product.is_active ? 'text-green-600' : 'text-neutral-600'}`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Product</span>
              </Link>
              <button
                onClick={toggleProductStatus}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  product.is_active
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{product.is_active ? 'Deactivate' : 'Activate'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}