"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  Star,
  Package,
  Truck,
  Shield,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/cart-context";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState("description");
  const [navigationState, setNavigationState] = useState<any>(null);
  const { addItem } = useCart();
  
  // Parse navigation state from URL
  useEffect(() => {
    const stateParam = searchParams.get('state');
    if (stateParam) {
      try {
        const parsedState = JSON.parse(decodeURIComponent(stateParam));
        setNavigationState(parsedState);
      } catch (e) {
        console.error('Error parsing navigation state:', e);
      }
    }
  }, [searchParams]);
  
  // Smart back navigation function
  const handleBackToShop = () => {
    if (navigationState) {
      // Build the URL with the saved state
      const params = new URLSearchParams();
      if (navigationState.search) params.set('search', navigationState.search);
      if (navigationState.category && navigationState.category !== 'all') params.set('category', navigationState.category);
      if (navigationState.priceRange && navigationState.priceRange !== 'all') params.set('priceRange', navigationState.priceRange);
      if (navigationState.sort && navigationState.sort !== 'name') params.set('sort', navigationState.sort);
      if (navigationState.page && navigationState.page !== 1) params.set('page', navigationState.page.toString());
      
      const queryString = params.toString();
      router.push(`/shop${queryString ? `?${queryString}` : ''}`);
    } else {
      router.push('/shop');
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", params.id)
          .eq("is_active", true)
          .single();

        if (error) {
          console.error("Error fetching product:", error);
          router.push("/shop");
          return;
        }

        setProduct(data);
      } catch (err) {
        console.error("Error:", err);
        router.push("/shop");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, router]);

  const handleAddToCart = () => {
    if (!product) return;

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url,
      });
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const adjustQuantity = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock_quantity || 0)) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navigation />
        <main className="pt-20 md:pt-24">
          <div className="max-w-7xl mx-auto px-8 lg:px-12 py-16">
            <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="aspect-square bg-stone-200 rounded-2xl"></div>
              <div className="space-y-6">
                <div className="h-8 bg-stone-200 rounded w-3/4"></div>
                <div className="h-6 bg-stone-200 rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-stone-200 rounded"></div>
                  <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                </div>
                <div className="h-12 bg-stone-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navigation />
        <main className="pt-20 md:pt-24">
          <div className="max-w-7xl mx-auto px-8 lg:px-12 py-16 text-center">
            <h1 className="font-crimson text-3xl font-normal text-stone-900 mb-4">
              Product Not Found
            </h1>
            <p className="font-lora text-stone-600 mb-8">
              The product you're looking for doesn't exist or is no longer
              available.
            </p>
            <Link
              href="/shop"
              className="bg-stone-800 text-amber-50 px-8 py-3 font-lora font-medium tracking-wide uppercase hover:bg-stone-700 transition-colors rounded-lg shadow-lg hover:shadow-xl"
            >
              Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navigation />

      <main className="pt-20 md:pt-24">
        {/* Smart Back Navigation */}
        <section className="py-4 bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToShop}
                className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {navigationState ? 'Back to results' : 'Back to Shop'}
                </span>
              </button>
              
              <div className="flex items-center space-x-2 text-xs text-stone-500">
                <Link href="/" className="hover:text-stone-700">Home</Link>
                <span>/</span>
                <button onClick={handleBackToShop} className="hover:text-stone-700">Shop</button>
                <span>/</span>
                <span className="text-stone-700 font-medium">{product.name}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Product Details */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Product Image */}
              <div className="space-y-6">
                <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-24 w-24 text-stone-400" />
                    </div>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-stone-50 rounded-lg">
                    <Truck className="h-6 w-6 text-stone-600 mx-auto mb-2" />
                    <p className="font-lora text-xs text-stone-600">
                      Free Shipping
                    </p>
                  </div>
                  <div className="text-center p-4 bg-stone-50 rounded-lg">
                    <Shield className="h-6 w-6 text-stone-600 mx-auto mb-2" />
                    <p className="font-lora text-xs text-stone-600">
                      Secure Payment
                    </p>
                  </div>
                  <div className="text-center p-4 bg-stone-50 rounded-lg">
                    <Heart className="h-6 w-6 text-stone-600 mx-auto mb-2" />
                    <p className="font-lora text-xs text-stone-600">Pet Safe</p>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-8">
                <div>
                  <p className="font-lora text-stone-600 text-sm uppercase tracking-wide mb-2">
                    {product.category}
                  </p>
                  <h1 className="font-crimson text-4xl md:text-5xl font-normal text-stone-900 mb-4">
                    {product.name}
                  </h1>

                  {/* Reviews placeholder */}
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 text-amber-400 fill-current"
                        />
                      ))}
                    </div>
                    <span className="font-lora text-sm text-stone-600">
                      (24 reviews)
                    </span>
                  </div>

                  <div className="text-3xl font-lora font-semibold text-stone-900 mb-6">
                    ${product.price.toFixed(2)}
                  </div>
                </div>

                {/* Stock Status */}
                <div className="flex items-center space-x-2">
                  {product.stock_quantity > 0 ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-lora text-green-700 font-medium">
                        {product.stock_quantity > 10
                          ? "In Stock"
                          : `Only ${product.stock_quantity} left!`}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-lora text-red-700 font-medium">
                        Out of Stock
                      </span>
                    </>
                  )}
                </div>

                {/* Quantity Selector */}
                {product.stock_quantity > 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-lora font-medium text-stone-900 mb-2">
                        Quantity
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center border border-stone-300 rounded-lg">
                          <button
                            onClick={() => adjustQuantity(-1)}
                            disabled={quantity <= 1}
                            className="p-3 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="px-4 py-3 font-lora font-medium">
                            {quantity}
                          </span>
                          <button
                            onClick={() => adjustQuantity(1)}
                            disabled={quantity >= product.stock_quantity}
                            className="p-3 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-lora text-stone-600 text-sm">
                          {product.stock_quantity} available
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add to Cart */}
                <div className="space-y-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0 || addedToCart}
                    className="w-full bg-stone-800 text-amber-50 py-4 px-8 font-lora font-medium tracking-wide uppercase hover:bg-stone-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    {addedToCart ? (
                      <>
                        <Check size={20} />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        <span>
                          {product.stock_quantity === 0
                            ? "Out of Stock"
                            : "Add to Cart"}
                        </span>
                      </>
                    )}
                  </button>

                  <Link
                    href="/shop/cart"
                    className="w-full border-2 border-stone-800 text-stone-800 py-4 px-8 font-lora font-medium tracking-wide uppercase hover:bg-stone-800 hover:text-amber-50 transition-colors rounded-lg flex items-center justify-center"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Details Tabs */}
        <section className="py-16 bg-stone-50">
          <div className="max-w-4xl mx-auto px-8 lg:px-12">
            <div className="border-b border-stone-200 mb-8">
              <nav className="flex space-x-8">
                {[
                  { id: "description", label: "Description" },
                  { id: "ingredients", label: "Ingredients" },
                  { id: "reviews", label: "Reviews" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`font-lora pb-4 border-b-2 transition-colors ${
                      selectedTab === tab.id
                        ? "border-amber-600 text-stone-900"
                        : "border-transparent text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-white rounded-2xl p-8">
              {selectedTab === "description" && (
                <div className="prose prose-stone max-w-none">
                  <p className="font-lora text-stone-700 leading-relaxed">
                    {product.description ||
                      "No description available for this product."}
                  </p>
                </div>
              )}

              {selectedTab === "ingredients" && (
                <div className="prose prose-stone max-w-none">
                  <p className="font-lora text-stone-700 leading-relaxed">
                    Ingredients information will be available soon. Please
                    contact us for specific ingredient details.
                  </p>
                </div>
              )}

              {selectedTab === "reviews" && (
                <div className="text-center py-8">
                  <p className="font-lora text-stone-600">
                    Customer reviews are coming soon!
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
