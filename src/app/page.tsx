import Navigation from '@/components/navigation'
import Hero from '@/components/sections/hero'
import Services from '@/components/sections/services'
import About from '@/components/sections/about'
import Testimonials from '@/components/sections/testimonials'
import Footer from '@/components/footer'
import { BusinessStructuredData, ServiceStructuredData, ReviewStructuredData } from '@/components/seo/structured-data'

export default function Home() {
  const sampleReviews = [
    {
      author: 'Sarah Johnson',
      datePublished: '2024-01-15',
      reviewBody: 'Amazing service! My dog Max loved staying here. Professional, caring, and trustworthy.',
      ratingValue: 5
    },
    {
      author: 'Michael Chen',
      datePublished: '2024-01-10',
      reviewBody: 'The daily photo updates were fantastic. Luna had a great time and I felt at ease.',
      ratingValue: 5
    },
    {
      author: 'Emily Rodriguez',
      datePublished: '2024-01-08',
      reviewBody: 'Excellent care for Charlie. The assessment visit was thorough and professional.',
      ratingValue: 5
    }
  ]

  return (
    <div className="min-h-screen">
      <BusinessStructuredData />
      <ServiceStructuredData />
      <ReviewStructuredData
        reviews={sampleReviews}
        aggregateRating={{
          ratingValue: 4.9,
          reviewCount: 47
        }}
      />
      
      <Navigation />
      <main>
        <Hero />
        <About />
        <Services />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}
