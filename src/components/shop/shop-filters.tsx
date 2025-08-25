'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Filter } from 'lucide-react'

export default function ShopFilters() {
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    brand: false
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const categories = [
    { name: 'All Products', count: 24 },
    { name: 'Treats & Snacks', count: 12 },
    { name: 'Toys & Enrichment', count: 8 },
    { name: 'Accessories', count: 4 }
  ]

  const priceRanges = [
    { name: 'Under $10', range: [0, 10] },
    { name: '$10 - $25', range: [10, 25] },
    { name: '$25 - $50', range: [25, 50] },
    { name: 'Over $50', range: [50, 999] }
  ]

  const brands = [
    { name: 'Natural Paws', count: 6 },
    { name: 'Happy Tails', count: 4 },
    { name: 'Organic Treats Co.', count: 3 },
    { name: 'Playful Pups', count: 5 }
  ]

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
            {categories.map((category, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                  defaultChecked={index === 0}
                />
                <span className="text-neutral-600 flex-1">{category.name}</span>
                <span className="text-neutral-400 text-sm">({category.count})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
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
            {priceRanges.map((range, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                />
                <span className="text-neutral-600">{range.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brands */}
      <div className="pb-6">
        <button
          onClick={() => toggleSection('brand')}
          className="flex items-center justify-between w-full text-left font-medium text-neutral-900 mb-4"
        >
          <span>Brands</span>
          {openSections.brand ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        
        {openSections.brand && (
          <div className="space-y-3">
            {brands.map((brand, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                />
                <span className="text-neutral-600 flex-1">{brand.name}</span>
                <span className="text-neutral-400 text-sm">({brand.count})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters */}
      <button className="w-full bg-neutral-100 text-neutral-600 py-2 px-4 rounded-lg hover:bg-neutral-200 transition-colors">
        Clear All Filters
      </button>
    </div>
  )
}