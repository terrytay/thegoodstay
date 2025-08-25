'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Edit, Trash2, Eye, MoreHorizontal, AlertTriangle } from 'lucide-react'

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

export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const fetchProducts = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } else {
        setProducts(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const toggleProductStatus = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) {
        console.error('Error updating product status:', error)
        return
      }

      // Update local state
      setProducts(prev =>
        prev.map(product =>
          product.id === id ? { ...product, is_active: !currentStatus } : product
        )
      )
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const deleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const supabase = createClient()
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error deleting product:', error)
          return
        }

        // Update local state
        setProducts(prev => prev.filter(product => product.id !== id))
      } catch (err) {
        console.error('Error:', err)
      }
    }
  }

  const toggleSelectProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id)
        ? prev.filter(productId => productId !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    setSelectedProducts(prev =>
      prev.length === products.length ? [] : products.map(p => p.id)
    )
  }

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'text-red-600' }
    if (quantity <= 5) return { label: 'Low Stock', color: 'text-yellow-600' }
    return { label: 'In Stock', color: 'text-green-600' }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="p-12 text-center">
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No Products Found</h3>
          <p className="text-neutral-600 mb-4">Get started by adding your first product to the catalog.</p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Add Product
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="px-6 py-3 border-b border-neutral-200 bg-amber-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-amber-800">
              {selectedProducts.length} product(s) selected
            </p>
            <div className="flex items-center space-x-2">
              <button className="text-sm text-amber-700 hover:text-amber-900 font-medium">
                Bulk Edit
              </button>
              <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length}
                  onChange={toggleSelectAll}
                  className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock_quantity)
              return (
                <tr key={product.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleSelectProduct(product.id)}
                      className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                        <span className="text-amber-600 text-xs">IMG</span>
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">{product.name}</div>
                        <div className="text-sm text-neutral-500 max-w-xs truncate">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-neutral-900">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-neutral-900">
                      ${product.price.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-neutral-900">
                        {product.stock_quantity}
                      </span>
                      {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      {product.stock_quantity === 0 && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className={`text-xs ${stockStatus.color}`}>
                      {stockStatus.label}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleProductStatus(product.id, product.is_active)}
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        product.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      {product.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-amber-600 hover:text-amber-900"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-neutral-400 hover:text-neutral-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-500">
            Showing 1 to {products.length} of {products.length} products
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50">
              Previous
            </button>
            <button className="px-3 py-1 text-sm bg-amber-600 text-white rounded">
              1
            </button>
            <button className="px-3 py-1 text-sm border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}