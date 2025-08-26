"use client";

import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import Link from "next/link";
import {
  Star,
  Heart,
  Award,
  ShoppingCart,
  Check,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Grid,
  List,
  Minus,
  Plus,
} from "lucide-react";
import { Metadata } from "next";
import { useState, useEffect, useCallback } from "react";
import { useCart } from "@/context/cart-context";
import { createClient } from "@/lib/supabase/client";
import shopData from "@/data/shop.json";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock_quantity: number;
  featured: boolean;
  created_at: string;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Quantity state for products (tracks cart quantities)
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});
  
  // Animation states
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [removingFromCart, setRemovingFromCart] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  // Categories and price ranges
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { addItem } = useCart();

  const fetchProducts = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const productsData = data || [];
      setProducts(productsData);

      // Extract unique categories
      const uniqueCategories = [
        ...new Set(productsData.map((p) => p.category)),
      ].sort();
      setCategories(uniqueCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort products
  const filterAndSortProducts = useCallback(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Price range filter
    if (selectedPriceRange !== "all") {
      switch (selectedPriceRange) {
        case "under-10":
          filtered = filtered.filter((product) => product.price < 10);
          break;
        case "10-25":
          filtered = filtered.filter(
            (product) => product.price >= 10 && product.price < 25
          );
          break;
        case "25-50":
          filtered = filtered.filter(
            (product) => product.price >= 25 && product.price < 50
          );
          break;
        case "over-50":
          filtered = filtered.filter((product) => product.price >= 50);
          break;
      }
    }

    // Sort products
    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "featured":
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, searchTerm, selectedCategory, selectedPriceRange, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    filterAndSortProducts();
  }, [filterAndSortProducts]);

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const getQuantity = (productId: string) => quantities[productId] || 0;
  
  const handleQuantityIncrease = async (product: Product) => {
    const currentQty = getQuantity(product.id);
    const newQty = currentQty + 1;
    
    // Show adding animation
    setAddingToCart(product.id);
    
    // Update local state
    setQuantities(prev => ({ ...prev, [product.id]: newQty }));
    
    // Add to cart
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
    });
    
    // Clear animation after a short delay
    setTimeout(() => setAddingToCart(null), 600);
  };
  
  const handleQuantityDecrease = (product: Product) => {
    const currentQty = getQuantity(product.id);
    if (currentQty > 0) {
      const newQty = currentQty - 1;
      
      // Show removing animation
      setRemovingFromCart(product.id);
      
      // Update local state
      setQuantities(prev => ({ 
        ...prev, 
        [product.id]: newQty === 0 ? 0 : newQty 
      }));
      
      // Remove from cart (assuming your cart context has a removeItem method)
      // For now, we'll assume the cart context handles individual item removal
      // You may need to modify your cart context to support this
      
      // Clear animation
      setTimeout(() => setRemovingFromCart(null), 600);
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case "amber":
        return "text-amber-600";
      case "red":
        return "text-red-600";
      case "green":
        return "text-green-600";
      case "blue":
        return "text-blue-600";
      default:
        return "text-stone-600";
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "star":
        return Star;
      case "heart":
        return Heart;
      case "award":
        return Award;
      default:
        return Star;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navigation />

      <main className="pt-20 md:pt-24">
        {/* Compact Header */}
        <section className="bg-white border-b border-stone-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-stone-900">Shop</h1>
                <p className="text-sm text-stone-600 mt-1">{filteredProducts.length} products found</p>
              </div>
              <div className="flex items-center space-x-3 text-sm text-stone-600">
                <span className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Free shipping over $50</span>
                <span className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Same day delivery</span>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Compact Search & Filter Bar */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(e.target.value)}
                    className="border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="all">All Prices</option>
                    <option value="under-10">Under $10</option>
                    <option value="10-25">$10-25</option>
                    <option value="25-50">$25-50</option>
                    <option value="over-50">$50+</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="name">Name A-Z</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                    <option value="featured">Featured</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="bg-white rounded-lg border border-stone-200 overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-stone-100"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                      <div className="h-3 bg-stone-100 rounded w-1/2"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-5 bg-stone-200 rounded w-16"></div>
                        <div className="h-3 bg-stone-100 rounded w-12"></div>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-8 h-8 bg-stone-100 rounded-full"></div>
                        <div className="w-8 h-4 bg-stone-100 rounded"></div>
                        <div className="w-8 h-8 bg-stone-100 rounded-full"></div>
                      </div>
                      <div className="h-10 bg-stone-200 rounded-lg"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-stone-600 font-lora text-lg">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="mt-4 bg-stone-800 text-amber-50 px-6 py-3 font-lora font-medium tracking-wide uppercase hover:bg-stone-700 transition-colors rounded shadow-lg hover:shadow-xl"
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                {searchTerm ||
                selectedCategory !== "all" ||
                selectedPriceRange !== "all" ? (
                  <div>
                    <p className="text-stone-600 font-lora text-lg mb-4">
                      No products match your search criteria.
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("all");
                        setSelectedPriceRange("all");
                      }}
                      className="bg-amber-600 text-white px-6 py-3 font-lora font-medium tracking-wide uppercase hover:bg-amber-700 transition-colors rounded-lg shadow-lg hover:shadow-xl"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <p className="text-stone-600 font-lora text-lg">
                    No products available at the moment.
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {currentProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      {/* Compact Product Image */}
                      <Link href={`/shop/product/${product.id}`}>
                        <div className="relative aspect-[4/3] bg-stone-50 cursor-pointer group">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingCart className="h-8 w-8 text-stone-300" />
                            </div>
                          )}
                          
                          {/* Compact Badges */}
                          <div className="absolute top-2 left-2 flex flex-col space-y-1">
                            {product.featured && (
                              <span className="bg-amber-500 text-white px-2 py-1 rounded text-xs font-medium">
                                Featured
                              </span>
                            )}
                            {product.stock_quantity === 0 && (
                              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                                Out of Stock
                              </span>
                            )}
                            {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
                              <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                                Low Stock
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* Compact Product Info */}
                      <div className="p-4">
                        <Link href={`/shop/product/${product.id}`}>
                          <h3 className="font-medium text-stone-900 text-sm line-clamp-2 hover:text-amber-600 transition-colors cursor-pointer mb-1">
                            {product.name}
                          </h3>
                        </Link>
                        
                        <p className="text-xs text-stone-500 mb-2">{product.category}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-semibold text-stone-900">
                            ${product.price.toFixed(2)}
                          </span>
                          <div className="flex items-center space-x-1 text-xs text-stone-500">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              product.stock_quantity > 0 ? "bg-green-500" : "bg-red-500"
                            }`}></div>
                            <span>{product.stock_quantity > 0 ? "In Stock" : "Out"}</span>
                          </div>
                        </div>

                        {/* Quantity Selector & Add to Cart */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-center space-x-3">
                            <button
                              onClick={() => updateQuantity(product.id, getQuantity(product.id) - 1)}
                              disabled={getQuantity(product.id) <= 1}
                              className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {getQuantity(product.id)}
                            </span>
                            <button
                              onClick={() => updateQuantity(product.id, getQuantity(product.id) + 1)}
                              disabled={getQuantity(product.id) >= product.stock_quantity}
                              className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock_quantity === 0}
                            className={`w-full py-2.5 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                              product.stock_quantity === 0
                                ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                                : addedToCart === product.id
                                ? "bg-green-500 text-white"
                                : "bg-amber-600 text-white hover:bg-amber-700"
                            }`}
                          >
                            {addedToCart === product.id ? (
                              <>
                                <Check size={16} />
                                <span>Added!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={16} />
                                <span>
                                  {product.stock_quantity === 0 ? "Sold Out" : "Add to Cart"}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Compact Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center">
                    <div className="flex items-center space-x-2 bg-white border border-stone-200 rounded-lg p-1">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 text-stone-500 hover:text-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      <div className="flex items-center space-x-1">
                        {[...Array(Math.min(5, totalPages))].map((_, index) => {
                          const pageNum =
                            currentPage <= 3
                              ? index + 1
                              : currentPage >= totalPages - 2
                              ? totalPages - 4 + index
                              : currentPage - 2 + index;

                          if (pageNum < 1 || pageNum > totalPages) return null;

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                                currentPage === pageNum
                                  ? "bg-amber-600 text-white"
                                  : "text-stone-700 hover:bg-stone-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 text-stone-500 hover:text-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
