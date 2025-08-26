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
  Grid,
  List,
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

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
    });

    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
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
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-amber-50 to-stone-100 py-24">
          <div className="max-w-4xl mx-auto px-8 lg:px-12 text-center">
            <h1 className="font-crimson text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-stone-900 mb-8 leading-tight">
              {shopData.hero.title}
            </h1>
            <p className="font-lora text-xl md:text-2xl text-stone-700 mb-16 leading-relaxed">
              {shopData.hero.subtitle}
            </p>

            <div className="flex flex-wrap justify-center gap-12 mb-16">
              {shopData.features.map((feature, index) => {
                const IconComponent = getIcon(feature.icon);
                return (
                  <div
                    key={index}
                    className="flex items-center space-x-3 text-stone-600"
                  >
                    <div className="p-3 rounded-full bg-white shadow-sm">
                      <IconComponent
                        className={`h-6 w-6 ${getIconColor(feature.color)}`}
                      />
                    </div>
                    <div className="text-left">
                      <div className="font-lora font-medium text-stone-900">
                        {feature.title}
                      </div>
                      <div className="font-lora text-sm text-stone-600">
                        {feature.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-8 lg:px-12">
            {/* Search and Filter Bar */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                {/* Filter Toggle & Controls */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                  </button>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                    <option value="featured">Featured First</option>
                  </select>

                  {/* View Mode */}
                  <div className="flex bg-stone-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === "grid"
                          ? "bg-white text-amber-600 shadow"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === "list"
                          ? "bg-white text-amber-600 shadow"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop Filters */}
              <div
                className={`mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 ${
                  showFilters ? "grid" : "hidden lg:grid"
                }`}
              >
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                {/* Price Filter */}
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Prices</option>
                  <option value="under-10">Under $10</option>
                  <option value="10-25">$10 - $25</option>
                  <option value="25-50">$25 - $50</option>
                  <option value="over-50">Over $50</option>
                </select>

                {/* Clear Filters */}
                {(searchTerm ||
                  selectedCategory !== "all" ||
                  selectedPriceRange !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setSelectedPriceRange("all");
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-stone-600">
                Showing {currentProducts.length} of {filteredProducts.length}{" "}
                products
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/5] bg-stone-200 mb-6 rounded-lg"></div>
                    <div className="space-y-4">
                      <div className="h-6 bg-stone-200 rounded"></div>
                      <div className="h-4 bg-stone-200 rounded"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-6 w-20 bg-stone-200 rounded"></div>
                        <div className="h-10 w-32 bg-stone-200 rounded"></div>
                      </div>
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
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                      : "space-y-6"
                  }
                >
                  {currentProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-200 ${
                        viewMode === "list" ? "flex" : ""
                      }`}
                    >
                      {/* Product Image */}
                      <Link href={`/shop/product/${product.id}`}>
                        <div
                          className={`bg-stone-100 overflow-hidden relative cursor-pointer ${
                            viewMode === "list"
                              ? "w-48 h-48 flex-shrink-0"
                              : "aspect-square"
                          }`}
                        >
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingCart className="h-16 w-16 text-stone-300" />
                            </div>
                          )}

                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>

                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex flex-col space-y-2">
                            {product.featured && (
                              <span className="bg-amber-600 text-white px-2 py-1 rounded text-xs font-medium">
                                Featured
                              </span>
                            )}
                            {product.stock_quantity === 0 && (
                              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                                Sold Out
                              </span>
                            )}
                            {product.stock_quantity > 0 &&
                              product.stock_quantity <= 5 && (
                                <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium">
                                  Low Stock
                                </span>
                              )}
                          </div>

                          {/* Quick Add Button */}
                          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
                              disabled={
                                product.stock_quantity === 0 ||
                                addedToCart === product.id
                              }
                              className="bg-white/90 backdrop-blur-sm text-stone-900 p-2 rounded-full shadow-lg hover:bg-white transition-colors disabled:opacity-50"
                            >
                              {addedToCart === product.id ? (
                                <Check size={16} />
                              ) : (
                                <ShoppingCart size={16} />
                              )}
                            </button>
                          </div>
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <Link href={`/shop/product/${product.id}`}>
                              <h3 className="font-lora font-medium text-stone-900 line-clamp-2 hover:text-amber-700 transition-colors cursor-pointer">
                                {product.name}
                              </h3>
                            </Link>
                            <p className="font-lora text-sm text-stone-600 mt-1">
                              {product.category}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-lora text-lg font-semibold text-stone-900">
                            ${product.price.toFixed(2)}
                          </span>

                          {/* Stock indicator */}
                          <div className="flex items-center space-x-1">
                            {product.stock_quantity > 0 ? (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            ) : (
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            )}
                            <span className="text-xs text-stone-500">
                              {product.stock_quantity > 0 ? "In Stock" : "Out"}
                            </span>
                          </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock_quantity === 0}
                          className="w-full bg-stone-900 text-white py-2.5 px-4 font-lora text-sm font-medium tracking-wide uppercase hover:bg-stone-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors rounded-lg flex items-center justify-center space-x-2"
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
                                {product.stock_quantity === 0
                                  ? "Sold Out"
                                  : "Add to Cart"}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center space-x-4">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="flex items-center space-x-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center space-x-2">
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
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              currentPage === pageNum
                                ? "bg-amber-600 text-white"
                                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="flex items-center space-x-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-24 bg-amber-50">
          <div className="max-w-4xl mx-auto px-8 lg:px-12 text-center">
            <h2 className="font-crimson text-4xl md:text-5xl font-normal text-stone-900 mb-8">
              {shopData.newsletter.title}
            </h2>
            <p className="font-lora text-lg text-stone-700 mb-12">
              {shopData.newsletter.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 bg-white border-2 border-stone-300 focus:border-stone-800 outline-none font-lora rounded"
              />
              <button className="bg-stone-800 text-amber-50 px-8 py-4 font-lora font-medium tracking-wide uppercase hover:bg-stone-700 transition-colors rounded shadow-lg hover:shadow-xl">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
