import Script from "next/script";

interface BusinessStructuredDataProps {
  name?: string;
  description?: string;
  url?: string;
  logo?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone?: string;
  email?: string;
  priceRange?: string;
}

export function BusinessStructuredData({
  name = "The Good Stay",
  description = "Professional dog boarding and pet care services with personalized attention.",
  url = "https://thegoodstay.vercel.app",
  logo = "https://thegoodstay.vercel.app/logo.jpg",
  address = {
    streetAddress: "123 Pet Care Lane",
    addressLocality: "Your City",
    addressRegion: "Your State",
    postalCode: "12345",
    addressCountry: "US",
  },
  telephone = "(555) 123-4567",
  email = "hello@thegoodstay.com",
  priceRange = "$15-$50",
}: BusinessStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    description,
    url,
    logo,
    image: logo,
    telephone,
    email,
    priceRange,
    address: {
      "@type": "PostalAddress",
      ...address,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "40.7128",
      longitude: "-74.0060",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "09:00",
        closes: "16:00",
      },
    ],
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: "40.7128",
        longitude: "-74.0060",
      },
      geoRadius: "25000",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Pet Care Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Dog Boarding",
            description: "Professional overnight care for your dog",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Assessment Visit",
            description: "Complimentary consultation to ensure compatibility",
          },
        },
      ],
    },
  };

  return (
    <Script
      id="business-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface ProductStructuredDataProps {
  name: string;
  description: string;
  image: string;
  sku: string;
  brand?: string;
  category: string;
  price: number;
  currency?: string;
  availability: "InStock" | "OutOfStock" | "PreOrder";
  url: string;
}

export function ProductStructuredData({
  name,
  description,
  image,
  sku,
  brand = "The Good Stay",
  category,
  price,
  currency = "USD",
  availability,
  url,
}: ProductStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    sku,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    category,
    offers: {
      "@type": "Offer",
      price: price.toFixed(2),
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      url,
      seller: {
        "@type": "Organization",
        name: "The Good Stay",
      },
    },
  };

  return (
    <Script
      id={`product-structured-data-${sku}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface ReviewStructuredDataProps {
  reviews: Array<{
    author: string;
    datePublished: string;
    reviewBody: string;
    ratingValue: number;
  }>;
  aggregateRating: {
    ratingValue: number;
    reviewCount: number;
  };
}

export function ReviewStructuredData({
  reviews,
  aggregateRating,
}: ReviewStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "The Good Stay",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: aggregateRating.ratingValue,
      reviewCount: aggregateRating.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    review: reviews.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author,
      },
      datePublished: review.datePublished,
      reviewBody: review.reviewBody,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.ratingValue,
        bestRating: 5,
        worstRating: 1,
      },
    })),
  };

  return (
    <Script
      id="review-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function ServiceStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Professional Dog Boarding Services",
    description:
      "Personalized dog boarding and pet care services with assessment visits",
    provider: {
      "@type": "LocalBusiness",
      name: "The Good Stay",
      url: "https://thegoodstay.vercel.app",
    },
    serviceType: "Pet Care",
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: "40.7128",
        longitude: "-74.0060",
      },
      geoRadius: "25000",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Dog Boarding Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Assessment Visit",
            description: "Free consultation to ensure compatibility",
          },
          price: "0",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Dog Boarding",
            description: "Overnight care in a safe, loving environment",
          },
          priceRange: "$30-$60",
          priceCurrency: "USD",
        },
      ],
    },
  };

  return (
    <Script
      id="service-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
