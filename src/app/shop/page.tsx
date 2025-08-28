"use client";

import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import Link from "next/link";
import { Star, Heart, Award, ShoppingCart, Minus, Plus } from "lucide-react";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useCart } from "@/context/cart-context";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

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

function ShopPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Quantity state for products (tracks cart quantities)
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  // Animation states
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [removingFromCart, setRemovingFromCart] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  // Categories and price ranges
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Navigation state for smart back button
  const [navigationState, setNavigationState] = useState({
    page: currentPage,
    search: searchTerm,
    category: selectedCategory,
    priceRange: selectedPriceRange,
    sort: sortBy,
  });

  // Product showcase states
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [lastScrollTime, setLastScrollTime] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const {
    addItem,
    removeItem,
    updateQuantity: updateCartQuantity,
    items: cartItems,
  } = useCart();

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

  // Restore state from URL parameters on page load
  useEffect(() => {
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "all";
    const priceRange = searchParams.get("priceRange") || "all";
    const sort = searchParams.get("sort") || "name";
    const page = parseInt(searchParams.get("page") || "1");

    setSearchTerm(search);
    setSelectedCategory(category);
    setSelectedPriceRange(priceRange);
    setSortBy(sort);
    setCurrentPage(page);
  }, [searchParams]);

  useEffect(() => {
    filterAndSortProducts();
  }, [filterAndSortProducts]);

  // Update navigation state when filters change
  useEffect(() => {
    const newState = {
      page: currentPage,
      search: searchTerm,
      category: selectedCategory,
      priceRange: selectedPriceRange,
      sort: sortBy,
    };
    setNavigationState(newState);
    localStorage.setItem("shopNavigationState", JSON.stringify(newState));
  }, [currentPage, searchTerm, selectedCategory, selectedPriceRange, sortBy]);

  // Function to create smart product link with state
  const createProductLink = (productId: string) => {
    const state = encodeURIComponent(JSON.stringify(navigationState));
    return `/shop/product/${productId}?state=${state}`;
  };

  // Sync local quantities with actual cart
  useEffect(() => {
    const syncedQuantities: { [key: string]: number } = {};
    cartItems.forEach((item) => {
      syncedQuantities[item.id] = item.quantity;
    });
    setQuantities(syncedQuantities);
  }, [cartItems]);

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const getQuantity = (productId: string) => quantities[productId] || 0;

  const handleQuantityIncrease = (product: Product) => {
    if (product.stock_quantity === 0) return;

    const currentQty = getQuantity(product.id);
    if (currentQty >= product.stock_quantity) return;

    // Show adding animation
    setAddingToCart(product.id);

    // Add to cart (cart context will handle the quantity increment)
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
      // Show removing animation
      setRemovingFromCart(product.id);

      // Update cart quantity (this will automatically sync back to local state)
      const newQty = currentQty - 1;
      if (newQty === 0) {
        removeItem(product.id);
      } else {
        updateCartQuantity(product.id, newQty);
      }

      // Clear animation
      setTimeout(() => setRemovingFromCart(null), 600);
    }
  };

  // Ultra-smooth ferris wheel scroll handler
  const handleImageScroll = useCallback(
    (e: React.WheelEvent) => {
      // Aggressive scroll prevention
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.preventDefault();
      e.nativeEvent.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();

      const now = Date.now();
      if (now - lastScrollTime < 50) return; // Ultra responsive

      // Cancel previous animation frame if still pending
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Use requestAnimationFrame for buttery smooth updates
      animationFrameRef.current = requestAnimationFrame(() => {
        setLastScrollTime(now);

        if (e.deltaY > 0) {
          // Scroll down - rotate ferris wheel clockwise (next product to center)
          setCurrentProductIndex((prev) =>
            prev < currentProducts.length - 1 ? prev + 1 : 0
          );
        } else {
          // Scroll up - rotate ferris wheel counter-clockwise (previous product to center)
          setCurrentProductIndex((prev) =>
            prev > 0 ? prev - 1 : currentProducts.length - 1
          );
        }
      });

      return false;
    },
    [currentProducts.length, lastScrollTime]
  );

  // Mouse enter/leave handlers for scroll locking
  const handleMouseEnter = useCallback(() => {
    setIsScrollLocked(true);
    document.body.style.overflow = "hidden";
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsScrollLocked(false);
    document.body.style.overflow = "unset";
  }, []);

  // Enhanced touch events for mobile with stronger prevention
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart) return;

      const touch = e.touches[0];
      const deltaY = touchStart.y - touch.clientY;

      if (Math.abs(deltaY) > 30) {
        e.preventDefault();
        e.stopPropagation();

        const now = Date.now();
        if (now - lastScrollTime < 300) return;

        setLastScrollTime(now);

        if (deltaY > 0) {
          // Swipe up - next product (rotate clockwise)
          setCurrentProductIndex((prev) =>
            prev < currentProducts.length - 1 ? prev + 1 : 0
          );
        } else {
          // Swipe down - previous product (rotate counter-clockwise)
          setCurrentProductIndex((prev) =>
            prev > 0 ? prev - 1 : currentProducts.length - 1
          );
        }

        setTouchStart(null);
      }
    },
    [touchStart, lastScrollTime, currentProducts.length]
  );

  // Reset product index when products change
  useEffect(() => {
    setCurrentProductIndex(0);
  }, [filteredProducts]);

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Calculate arc positions following the drawn path
  const getArcPathPosition = useCallback(
    (index: number, totalProducts: number, currentIndex: number) => {
      if (totalProducts === 0) return null;

      const arcRadius = 450;
      const centerX = -80; // Slightly left of center
      const centerY = 10;

      // Only show previous, current, and next products
      if (index === currentIndex) {
        // Current product: Center-left of the arc (9 o'clock position)
        const angle = Math.PI; // 180 degrees
        return {
          x: centerX + Math.cos(angle) * arcRadius,
          y: centerY + Math.sin(angle) * arcRadius,
          scale: 1.2, // Large but not overwhelming
          opacity: 1,
          zIndex: 10,
          rotateZ: 0,
          blur: 0,
          pointerEvents: "auto",
        };
      }

      // Previous product: Top-right of arc (around 1-2 o'clock position)
      const prevIndex =
        currentIndex === 0 ? totalProducts - 1 : currentIndex - 1;
      if (index === prevIndex) {
        const angle = (13.2 * Math.PI) / 6; // -30 degrees (1 o'clock)
        return {
          x: centerX + Math.cos(angle) * arcRadius,
          y: centerY + Math.sin(angle) * arcRadius,
          scale: 0.4,
          opacity: 0.4,
          zIndex: 8,
          rotateZ: -8,
          blur: 1,
          pointerEvents: "none",
        };
      }

      // Next product: Bottom-right of arc (around 4-5 o'clock position)
      const nextIndex =
        currentIndex === totalProducts - 1 ? 0 : currentIndex + 1;
      if (index === nextIndex) {
        const angle = (10 * Math.PI) / 6; // -150 degrees (5 o'clock)
        return {
          x: centerX + Math.cos(angle) * arcRadius,
          y: centerY + Math.sin(angle) * arcRadius,
          scale: 0.4,
          opacity: 0.4,
          zIndex: 8,
          rotateZ: 8,
          blur: 1,
          pointerEvents: "none",
        };
      }

      // Hide all other products
      return null;
    },
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-white">
      <Navigation />

      <main className="pt-20 md:pt-24">
        {/* Premium Product Showcase Layout */}
        <div
          className="min-h-screen grid grid-cols-12 relative"
          style={{ minHeight: "100vh" }}
        >
          {/* Left Panel - Product Details (Fixed Position) */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3 bg-white/80 backdrop-blur-md border-r border-stone-200/50 p-8 lg:p-12 flex flex-col justify-center relative z-10">
            {currentProducts.length > 0 && (
              <div className="space-y-8 max-w-md">
                {/* Brand/Category */}
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-stone-500 font-medium">
                    {currentProducts[currentProductIndex]?.category}
                  </p>
                  <h1 className="text-3xl lg:text-4xl xl:text-5xl font-light text-stone-900 leading-tight">
                    {currentProducts[currentProductIndex]?.name}
                  </h1>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <div className="text-3xl lg:text-4xl font-light text-stone-900">
                    ${currentProducts[currentProductIndex]?.price.toFixed(2)}
                  </div>
                  {currentProducts[currentProductIndex]?.stock_quantity <= 5 &&
                    currentProducts[currentProductIndex]?.stock_quantity >
                      0 && (
                      <p className="text-sm text-amber-600 font-medium">
                        Only{" "}
                        {currentProducts[currentProductIndex]?.stock_quantity}{" "}
                        left
                      </p>
                    )}
                </div>

                {/* Description */}
                <p className="text-stone-600 leading-relaxed">
                  {currentProducts[currentProductIndex]?.description ||
                    "Premium quality product crafted with attention to detail and designed for the modern lifestyle."}
                </p>

                {/* Smart Quantity Controls */}
                {currentProducts[currentProductIndex]?.stock_quantity === 0 ? (
                  <div className="py-4 px-6 bg-stone-100 text-stone-400 text-center rounded-lg">
                    Out of Stock
                  </div>
                ) : (
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-4">
                      {getQuantity(currentProducts[currentProductIndex]?.id) >
                        0 && (
                        <button
                          onClick={() =>
                            handleQuantityDecrease(
                              currentProducts[currentProductIndex]
                            )
                          }
                          className="w-12 h-12 rounded-full border-2 border-stone-300 flex items-center justify-center text-stone-600 hover:border-red-400 hover:text-red-600 transition-all duration-200"
                        >
                          <Minus size={20} />
                        </button>
                      )}

                      {getQuantity(currentProducts[currentProductIndex]?.id) >
                      0 && (
                        <div className="flex flex-col items-center min-w-[60px]">
                          <span className="text-2xl font-light text-stone-900">
                            {getQuantity(
                              currentProducts[currentProductIndex]?.id
                            )}
                          </span>
                          <span className="text-xs text-green-600 font-medium uppercase tracking-wide">
                            in cart
                          </span>
                        </div>
                      )}
												{getQuantity(currentProducts[currentProductIndex]?.id) > 0 ? (<button
                        onClick={() =>
                          handleQuantityIncrease(
                            currentProducts[currentProductIndex]
                          )
                        }
                        disabled={
                          getQuantity(
                            currentProducts[currentProductIndex]?.id
                          ) >=
                          currentProducts[currentProductIndex]?.stock_quantity
                        }
                        className="w-12 h-12 rounded-full border-2 border-amber-400 flex items-center justify-center text-amber-600 hover:bg-amber-50 hover:border-amber-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={20} />
                      </button>) : (

                    <button
                      onClick={() =>
                        handleQuantityIncrease(
                          currentProducts[currentProductIndex]
                        )
                      }
                      disabled={
                        currentProducts[currentProductIndex]?.stock_quantity ===
                        0
                      }
                      className="flex-1 bg-stone-900 text-white py-4 px-8 rounded-lg hover:bg-stone-800 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed font-medium tracking-wide uppercase text-sm"
                    >
                      Add to Bag
                    </button>
		      )}
                    </div>

                    {/* Add to Bag Button */}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Center Stage - Clock-Face Product Layout */}
          <div
            ref={showcaseRef}
            className="col-span-12 lg:col-span-6 xl:col-span-7 relative flex items-stretch justify-items-stretch overflow-hidden product-showcase-arc"
            onWheelCapture={handleImageScroll}
            onWheel={handleImageScroll}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={
              {
                touchAction: "none",
                overscrollBehavior: "none",
                WebkitOverscrollBehavior: "none",
                minHeight: "100vh",
              } as React.CSSProperties
            }
          >
            {loading ? (
              <div className="w-full h-full bg-stone-200 rounded-full animate-pulse" />
            ) : currentProducts.length > 0 ? (
              <div className="relative w-full h-full flex items-center justify-center perspective-1000">
                {/* Light Gray Arc Background Guide */}
                <div className="absolute inset-0 pointer-events-none z-0">
                  <svg width="100%" height="100%" viewBox="30 0 50 300">
                    <path
                      d="M150 -1 A100 100 0 0 0 150 250"
                      stroke="#F0F0F0"
                      strokeWidth="1"
                      opacity="0.5"
                      fill="none"
                    />
                  </svg>
                </div>

                {/* Product Counter - Right Side Vertical */}
                <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20">
                  <div className="flex flex-col items-center space-y-6">
                    {/* Scroll Hint */}
                    <div className="text-center">
                      <div className="text-xs text-stone-400 mb-2">scroll</div>
                      <div className="flex flex-col items-center space-y-1">
                        <div className="w-0.5 h-6 bg-stone-300"></div>
                        <div className="w-1 h-1 bg-stone-400 rounded-full"></div>
                        <div className="w-0.5 h-6 bg-stone-300"></div>
                      </div>
                    </div>

                    {/* Product Counter */}
                    <div className="text-center">
                      <span className="text-xs text-stone-500 font-medium">
                        {String(currentProductIndex + 1).padStart(2, "0")} /{" "}
                        {String(currentProducts.length).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Vertical Dots */}
                    <div className="flex flex-col space-y-2">
                      {currentProducts.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentProductIndex(index)}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            index === currentProductIndex
                              ? "bg-stone-900 scale-125 shadow-sm"
                              : "bg-stone-300 hover:bg-stone-400 hover:scale-110"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Arc Path Product Display */}
                {currentProducts.map((product, index) => {
                  const position = getArcPathPosition(
                    index,
                    currentProducts.length,
                    currentProductIndex
                  );

                  // Only render visible products (previous, current, next)
                  if (!position) return null;

                  return (
                    <div
                      key={product.id}
                      className={`absolute transition-all duration-700 ease-out transform-gpu product-card-3d ${
                        index === currentProductIndex
                          ? "arc-center-active cursor-pointer"
                          : "cursor-default"
                      }`}
                      onClick={
                        index === currentProductIndex
                          ? undefined
                          : () => setCurrentProductIndex(index)
                      }
                      style={{
                        transform: `
                          translate3d(${position.x}px, ${position.y}px, 0) 
                          scale(${position.scale}) 
                          rotateZ(${position.rotateZ}deg)
                        `,
                        opacity: position.opacity,
                        zIndex: position.zIndex,
                        filter: `blur(${position.blur}px) drop-shadow(0 ${
                          10 * position.scale
                        }px ${20 * position.scale}px rgba(0,0,0,0.15))`,
                        transformOrigin: "center center",
                        backfaceVisibility: "hidden",
                        willChange: "transform, opacity, filter",
                        pointerEvents:
                          position.pointerEvents as React.CSSProperties["pointerEvents"],
                      }}
                    >
                      <div className="w-[60%] h-[100%] flex items-center justify-center">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain"
                            style={{
                              transformStyle: "preserve-3d",
                            }}
                          />
                        ) : (
                          <div className="w-64 h-64 flex items-center justify-center">
                            <ShoppingCart className="w-32 h-32 text-stone-300 opacity-50" />
                          </div>
                        )}
                      </div>

                      {/* Featured Badge */}
                      {product.featured && (
                        <div className="absolute -top-4 -right-4 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                          Featured
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-stone-500">
                <ShoppingCart className="w-24 h-24 mx-auto mb-4 opacity-30" />
                <p>No products available</p>
              </div>
            )}
          </div>

          {/* Right Panel - Categories (Fixed Position) */}
          <div className="col-span-12 lg:col-span-2 bg-white/80 backdrop-blur-md border-l border-stone-200/50 p-6 lg:p-8 flex flex-col justify-center relative z-10">
            <div className="space-y-6">
              <h3 className="text-sm uppercase tracking-widest text-stone-500 font-medium">
                Categories
              </h3>

              <div className="space-y-4">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`block text-left transition-colors duration-200 ${
                    selectedCategory === "all"
                      ? "text-stone-900 font-medium"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  All Products
                </button>

                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`block text-left transition-colors duration-200 ${
                      selectedCategory === category
                        ? "text-stone-900 font-medium"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* View All Link */}
              <div className="pt-6 border-t border-stone-200">
                <Link
                  href="/shop/cart"
                  className="text-xs uppercase tracking-wide text-amber-600 hover:text-amber-700 font-medium"
                >
                  View Cart →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Content to Test Page Scrolling */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-8 lg:px-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-light text-stone-900 mb-8">
              Why Choose Our Products?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-medium text-stone-900">
                  Premium Quality
                </h3>
                <p className="text-stone-600 text-sm">
                  Every product is carefully selected and tested for quality and
                  durability.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-stone-900">Pet Safe</h3>
                <p className="text-stone-600 text-sm">
                  All materials are non-toxic and safe for your beloved pets.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-stone-900">
                  Easy Shopping
                </h3>
                <p className="text-stone-600 text-sm">
                  Simple, secure checkout with fast delivery to your door.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-stone-600">Loading shop...</p>
          </div>
        </div>
      }
    >
      <ShopPageContent />
    </Suspense>
  );
}
