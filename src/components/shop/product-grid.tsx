'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, ShoppingCart, Heart, Grid, List } from 'lucide-react'

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

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('name')

  // Sample products for demonstration
  const sampleProducts: Product[] = [
    {
      id: '1',
      name: 'Premium Salmon Treats',
      description: 'Wild-caught salmon treats that dogs absolutely love. Made with natural ingredients and no artificial preservatives.',
      price: 24.99,
      category: 'Treats & Snacks',
      image_url: '/placeholder-product.jpg',
      stock_quantity: 15,
      is_active: true
    },
    {
      id: '2',
      name: 'Interactive Puzzle Toy',
      description: 'Mental stimulation toy that challenges your dog and helps reduce boredom. Perfect for intelligent breeds.',
      price: 32.99,
      category: 'Toys & Enrichment',
      image_url: '/placeholder-product.jpg',
      stock_quantity: 8,
      is_active: true
    },
    {
      id: '3',
      name: 'Organic Peanut Butter Biscuits',
      description: 'Handmade organic biscuits with natural peanut butter. No sugar, salt, or artificial additives.',
      price: 18.99,
      category: 'Treats & Snacks',
      image_url: '/placeholder-product.jpg',
      stock_quantity: 22,
      is_active: true
    },
    {
      id: '4',
      name: 'Comfort Blanket',
      description: 'Ultra-soft fleece blanket that provides comfort and warmth. Perfect for anxious dogs or cold nights.',
      price: 45.99,
      category: 'Accessories',
      image_url: '/placeholder-product.jpg',
      stock_quantity: 5,
      is_active: true
    },
    {
      id: '5',
      name: 'Natural Dental Chews',
      description: 'Help maintain your dog\'s dental health with these natural chews. Reduces tartar and freshens breath.',
      price: 29.99,
      category: 'Treats & Snacks',
      image_url: '/placeholder-product.jpg',
      stock_quantity: 12,
      is_active: true
    },
    {
      id: '6',
      name: 'Rope Tug Toy',
      description: 'Durable cotton rope toy perfect for interactive play and teeth cleaning. Great for active dogs.',
      price: 15.99,
      category: 'Toys & Enrichment',
      image_url: '/placeholder-product.jpg',
      stock_quantity: 18,
      is_active: true
    }
  ]

  const fetchProducts = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching products:', error)
        // Use sample products if database is not set up
        setProducts(sampleProducts)
      } else {
        setProducts(data || sampleProducts)
      }
    } catch (err) {
      console.error('Error:', err)
      setProducts(sampleProducts)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const addToCart = (productId: string) => {
    // TODO: Implement cart functionality
    console.log('Adding product to cart:', productId)
  }

  const toggleWishlist = (productId: string) => {
    // TODO: Implement wishlist functionality
    console.log('Toggling wishlist for product:', productId)
  }

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 bg-neutral-200 rounded w-48 animate-pulse"></div>
          <div className="flex space-x-4">
            <div className="h-10 bg-neutral-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-neutral-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
              <div className="h-48 bg-neutral-200"></div>
              <div className="p-6">
                <div className="h-6 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded mb-4 w-3/4"></div>
                <div className="h-8 bg-neutral-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header with sorting and view options */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            All Products ({products.length})
          </h2>
          <p className="text-neutral-600 mt-1">Premium quality products for your beloved pet</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="category">Category</option>
          </select>
          
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-amber-600 shadow' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-amber-600 shadow' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className={viewMode === 'grid' 
        ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' 
        : 'space-y-6'
      }>
        {products.map((product) => (
          <div
            key={product.id}
            className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${
              viewMode === 'list' ? 'flex' : ''
            }`}
          >
            {/* Product Image */}
            <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'h-48'}`}>
              <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <span className="text-amber-600 text-sm">Product Image</span>
              </div>
              
              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-neutral-50 transition-colors"
              >
                <Heart className="h-4 w-4 text-neutral-600" />
              </button>
              
              {/* Category Badge */}
              <div className="absolute top-3 left-3">
                <span className="bg-amber-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg text-neutral-900 line-clamp-1">
                  {product.name}
                </h3>
                <div className="flex items-center space-x-1 ml-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-neutral-900">
                    ${product.price.toFixed(2)}
                  </span>
                  <p className="text-xs text-neutral-500 mt-1">
                    {product.stock_quantity > 0 
                      ? `${product.stock_quantity} in stock` 
                      : 'Out of stock'
                    }
                  </p>
                </div>
                
                <button
                  onClick={() => addToCart(product.id)}
                  disabled={product.stock_quantity === 0}
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {products.length > 0 && (
        <div className="text-center mt-12">
          <button className="bg-neutral-100 text-neutral-700 px-8 py-3 rounded-lg hover:bg-neutral-200 transition-colors">
            Load More Products
          </button>
        </div>
      )}
    </div>
  )
}