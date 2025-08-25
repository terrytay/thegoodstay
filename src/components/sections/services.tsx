import Link from 'next/link'
import { Calendar, Home, ShoppingBag, Camera, Clock, MapPin } from 'lucide-react'

export default function Services() {
  const services = [
    {
      icon: Calendar,
      title: 'Assessment Visits',
      description: 'A complimentary meet-and-greet to ensure compatibility before any boarding arrangement.',
      features: ['Meet in comfortable environment', 'Discuss your dog\'s needs', 'No obligation consultation'],
      cta: 'Book Assessment',
      link: '/book-assessment',
      primary: true
    },
    {
      icon: Home,
      title: 'Dog Boarding',
      description: 'Professional overnight care in a safe, loving environment when you\'re away.',
      features: ['Daily walks & playtime', 'Comfortable sleeping arrangements', 'Regular feeding schedule'],
      cta: 'Learn More',
      link: '/services/boarding',
      primary: false
    },
    {
      icon: ShoppingBag,
      title: 'Premium Pet Shop',
      description: 'Carefully curated treats, toys, and accessories for your beloved pet.',
      features: ['High-quality treats', 'Interactive toys', 'Essential accessories'],
      cta: 'Shop Now',
      link: '/shop',
      primary: false
    }
  ]

  const additionalServices = [
    {
      icon: Camera,
      title: 'Daily Photo Updates',
      description: 'Stay connected with your pet through regular photos and updates.'
    },
    {
      icon: Clock,
      title: 'Flexible Pick-up/Drop-off',
      description: 'Convenient scheduling that works with your busy lifestyle.'
    },
    {
      icon: MapPin,
      title: 'Local Area Walks',
      description: 'Safe neighborhood walks to keep your dog active and socialized.'
    }
  ]

  return (
    <section className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
            Comprehensive Care Services
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            From initial consultations to premium products, everything your dog needs for a comfortable and happy stay.
          </p>
        </div>

        {/* Main Services */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div 
                key={index} 
                className={`relative rounded-2xl p-8 transition-all duration-300 hover:transform hover:scale-105 ${
                  service.primary 
                    ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xl' 
                    : 'bg-white hover:shadow-lg border border-neutral-200'
                }`}
              >
                {service.primary && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-white text-amber-600 px-4 py-1 rounded-full text-sm font-semibold">
                      Start Here
                    </span>
                  </div>
                )}
                
                <div className={`p-3 rounded-xl inline-block mb-6 ${
                  service.primary ? 'bg-white/20' : 'bg-amber-100'
                }`}>
                  <Icon className={`h-8 w-8 ${service.primary ? 'text-white' : 'text-amber-600'}`} />
                </div>
                
                <h3 className={`font-semibold text-xl mb-4 ${
                  service.primary ? 'text-white' : 'text-neutral-900'
                }`}>
                  {service.title}
                </h3>
                
                <p className={`mb-6 ${
                  service.primary ? 'text-white/90' : 'text-neutral-600'
                }`}>
                  {service.description}
                </p>
                
                <ul className="space-y-2 mb-8">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className={`flex items-center space-x-2 text-sm ${
                      service.primary ? 'text-white/90' : 'text-neutral-600'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        service.primary ? 'bg-white' : 'bg-amber-500'
                      }`}></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  href={service.link}
                  className={`block text-center py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
                    service.primary
                      ? 'bg-white text-amber-600 hover:bg-neutral-100'
                      : 'bg-amber-600 text-white hover:bg-amber-700'
                  }`}
                >
                  {service.cta}
                </Link>
              </div>
            )
          })}
        </div>

        {/* Additional Services */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
          <h3 className="font-playfair text-2xl md:text-3xl font-bold text-neutral-900 mb-8 text-center">
            What&apos;s Included
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {additionalServices.map((service, index) => {
              const Icon = service.icon
              return (
                <div key={index} className="text-center">
                  <div className="bg-amber-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-amber-600" />
                  </div>
                  <h4 className="font-semibold text-neutral-900 mb-2">{service.title}</h4>
                  <p className="text-neutral-600 text-sm">{service.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="font-playfair text-2xl md:text-3xl font-bold mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Book your complimentary assessment visit today and see why families trust us with their beloved pets.
            </p>
            <Link
              href="/book-assessment"
              className="bg-white text-amber-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-neutral-100 transition-all duration-300 inline-block"
            >
              Schedule Assessment Visit
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}