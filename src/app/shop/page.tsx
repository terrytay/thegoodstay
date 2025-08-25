import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import ProductGrid from "@/components/shop/product-grid";
import ShopFilters from "@/components/shop/shop-filters";
import { ShoppingBag, Star, Heart, Award } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Pet Shop",
  description:
    "Shop premium dog treats, toys, and accessories. Carefully curated products that are personally tested and approved. Quality guaranteed.",
  keywords: [
    "dog treats",
    "pet toys",
    "dog accessories",
    "premium pet products",
    "organic dog treats",
    "interactive dog toys",
  ],
  openGraph: {
    title: "Premium Pet Shop | The Good Stay",
    description:
      "Shop premium dog treats, toys, and accessories. Quality guaranteed, personally tested products.",
    url: "https://thegoodstay.vercel.app/shop",
  },
};

export default function ShopPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-full shadow-lg">
                  <ShoppingBag className="h-12 w-12 text-amber-600" />
                </div>
              </div>

              <h1 className="font-playfair text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                Premium Pet Shop
              </h1>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
                Carefully curated treats, toys, and accessories for your beloved
                companion. Only the best quality products that I trust and use
                myself.
              </p>

              <div className="flex flex-wrap justify-center gap-8">
                <div className="flex items-center space-x-2 text-neutral-600">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Premium Quality</span>
                </div>
                <div className="flex items-center space-x-2 text-neutral-600">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Dog Approved</span>
                </div>
                <div className="flex items-center space-x-2 text-neutral-600">
                  <Award className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Personally Tested</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shop Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar Filters */}
              <div className="lg:col-span-1">
                <ShopFilters />
              </div>

              {/* Product Grid */}
              <div className="lg:col-span-3">
                <ProductGrid />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-neutral-900 text-center mb-12">
              Why Shop With Us?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-xl mb-4">
                  Quality Guaranteed
                </h3>
                <p className="text-neutral-600">
                  Every product is personally tested and approved. I only sell
                  items I would give to my own furry friends.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-xl mb-4">Made with Love</h3>
                <p className="text-neutral-600">
                  Supporting small businesses and artisans who create products
                  with genuine care for pet health and happiness.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-xl mb-4">
                  Expert Recommendations
                </h3>
                <p className="text-neutral-600">
                  Get personalized product recommendations based on your
                  dog&apos;s specific needs and preferences.
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
