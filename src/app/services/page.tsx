import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Metadata } from 'next'
import { Check } from 'lucide-react'
import servicesData from '@/data/services.json'

export const metadata: Metadata = {
  title: 'Dog Boarding Services - Assessment Visits & Overnight Care',
  description: 'Comprehensive dog boarding services including complimentary assessment visits, overnight boarding, day care, and special needs care.',
  keywords: [
    'dog boarding services',
    'assessment visit',
    'overnight boarding',
    'day care',
    'special needs care',
    'pet services',
  ],
  openGraph: {
    title: 'Dog Boarding Services - Assessment Visits & Overnight Care',
    description: 'Professional dog boarding and care services tailored to your pet\'s unique needs.',
    url: 'https://thegoodstay.vercel.app/services',
  },
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navigation />
      <main className="pt-20 md:pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-amber-50 to-stone-100 py-24">
          <div className="max-w-4xl mx-auto px-8 lg:px-12 text-center">
            <h1 className="font-crimson text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-stone-900 mb-8 leading-tight">
              {servicesData.hero.title}
            </h1>
            <p className="font-lora text-xl md:text-2xl text-stone-700 mb-8 leading-relaxed">
              {servicesData.hero.subtitle}
            </p>
          </div>
        </section>

        {/* Services Grid */}
        {servicesData.services.map((service, index) => (
          <section key={index} className={`py-24 ${index % 2 === 0 ? 'bg-white' : 'bg-stone-50'}`}>
            <div className="max-w-7xl mx-auto px-8 lg:px-12">
              <div className={`grid lg:grid-cols-2 gap-16 lg:gap-24 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
              }`}>
                <div className={index % 2 === 1 ? 'lg:order-2' : 'lg:order-1'}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-crimson text-4xl md:text-5xl font-normal text-stone-900">
                      {service.title}
                    </h2>
                    <div className="text-right">
                      <div className="font-lora text-2xl font-medium text-stone-900">
                        {service.price}
                      </div>
                      <div className="font-lora text-sm text-stone-600">
                        {service.duration}
                      </div>
                    </div>
                  </div>
                  
                  <p className="font-lora text-lg text-stone-700 leading-relaxed mb-8">
                    {service.description}
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span className="font-lora text-stone-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={index % 2 === 1 ? 'lg:order-1' : 'lg:order-2'}>
                  <div className="aspect-[4/5] bg-stone-200 rounded-lg overflow-hidden">
                    {/* Placeholder for service image */}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* Process Section */}
        <section className="py-24 bg-amber-50">
          <div className="max-w-7xl mx-auto px-8 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="font-crimson text-4xl md:text-5xl font-normal text-stone-900 mb-6">
                {servicesData.process.title}
              </h2>
              <div className="w-24 h-px bg-amber-600 mx-auto"></div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {servicesData.process.steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-stone-800 text-amber-50 rounded-full flex items-center justify-center font-crimson text-2xl font-normal mx-auto mb-6">
                    {step.number}
                  </div>
                  <h3 className="font-crimson text-xl font-normal text-stone-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="font-lora text-stone-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Guarantee Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-8 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div>
                <h2 className="font-crimson text-4xl md:text-5xl font-normal text-stone-900 mb-8">
                  {servicesData.guarantee.title}
                </h2>
                <p className="font-lora text-lg text-stone-700 leading-relaxed mb-8">
                  {servicesData.guarantee.description}
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {servicesData.guarantee.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="font-lora text-stone-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="aspect-[4/5] bg-stone-200 rounded-lg overflow-hidden">
                  {/* Placeholder for guarantee image */}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-amber-50">
          <div className="max-w-4xl mx-auto px-8 lg:px-12 text-center">
            <h2 className="font-crimson text-4xl md:text-5xl font-normal text-stone-900 mb-8">
              Ready to experience the difference?
            </h2>
            <p className="font-lora text-lg text-stone-700 mb-12">
              Book your complimentary assessment visit and discover personalized care for your companion
            </p>
            <a
              href="/book-assessment"
              className="inline-block bg-stone-800 text-amber-50 px-12 py-6 font-lora font-medium tracking-wide uppercase hover:bg-stone-700 transition-colors shadow-lg hover:shadow-xl rounded"
            >
              Book Assessment Visit
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}