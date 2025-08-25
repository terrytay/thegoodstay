'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown, ChevronUp, Filter } from 'lucide-react'

interface CategoryCount {
  category: string
  count: number
}

interface PriceCount {
  range: string
  count: number
}

export default function ShopFilters() {
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true
  })
  
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([])
  const [priceCounts, setPriceCounts] = useState<PriceCount[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [loading, setLoading] = useState(true)

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const fetchProductCounts = useCallback(async () => {
    try {
      const supabase = createClient()
      
      // Get all active products with their categories and prices
      const { data: products, error } = await supabase
        .from('products')
        .select('category, price')
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching products for filters:', error)
        return
      }

      if (!products) return

      // Count total products
      setTotalProducts(products.length)

      // Count by category
      const categoryMap = new Map<string, number>()
      products.forEach(product => {
        const category = product.category || 'Other'
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
      })
      
      const categoryCountsArray: CategoryCount[] = Array.from(categoryMap, ([category, count]) => ({
        category,
        count
      }))
      setCategoryCounts(categoryCountsArray)

      // Count by price ranges
      const priceRanges = [
        { name: 'Under $10', min: 0, max: 10 },
        { name: '$10 - $25', min: 10, max: 25 },
        { name: '$25 - $50', min: 25, max: 50 },
        { name: 'Over $50', min: 50, max: 999999 }
      ]

      const priceCountsArray: PriceCount[] = priceRanges.map(range => {
        const count = products.filter(product => 
          product.price >= range.min && product.price < range.max
        ).length
        
        return { range: range.name, count }
      })
      
      setPriceCounts(priceCountsArray)
      
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProductCounts()
  }, [fetchProductCounts])


  if (!loading && totalProducts === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Filter className="h-5 w-5 text-amber-600" />
          <h2 className="font-semibold text-lg">Filter Products</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-neutral-600">No products available to filter.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Filter className="h-5 w-5 text-amber-600" />
        <h2 className="font-semibold text-lg">Filter Products</h2>
      </div>

      {/* Categories */}
      <div className="border-b border-neutral-200 pb-6 mb-6">
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full text-left font-medium text-neutral-900 mb-4"
        >
          <span>Categories</span>
          {openSections.category ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        
        {openSections.category && (
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-neutral-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-neutral-200 rounded flex-1 animate-pulse"></div>
                    <div className="w-8 h-4 bg-neutral-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                    defaultChecked={true}
                  />
                  <span className="text-neutral-600 flex-1">All Products</span>
                  <span className="text-neutral-400 text-sm">({totalProducts})</span>
                </label>
                {categoryCounts
                  .filter(category => category.count > 0)
                  .map((category, index) => (
                    <label key={index} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-neutral-600 flex-1">{category.category}</span>
                      <span className="text-neutral-400 text-sm">({category.count})</span>
                    </label>
                  ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Price Range */}
      {(loading || priceCounts.some(p => p.count > 0)) && (
        <div className="border-b border-neutral-200 pb-6 mb-6">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full text-left font-medium text-neutral-900 mb-4"
          >
            <span>Price Range</span>
            {openSections.price ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          {openSections.price && (
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-neutral-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-neutral-200 rounded flex-1 animate-pulse"></div>
                      <div className="w-8 h-4 bg-neutral-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                priceCounts
                  .filter(priceRange => priceRange.count > 0)
                  .map((priceRange, index) => (
                    <label key={index} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                      />
                      <span className="text-neutral-600 flex-1">{priceRange.range}</span>
                      <span className="text-neutral-400 text-sm">({priceRange.count})</span>
                    </label>
                  ))
              )}
            </div>
          )}
        </div>
      )}


      {/* Clear Filters */}
      <button className="w-full bg-neutral-100 text-neutral-600 py-2 px-4 rounded-lg hover:bg-neutral-200 transition-colors">
        Clear All Filters
      </button>
    </div>
  )
}