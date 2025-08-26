import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Metadata } from "next";
import aboutData from "@/data/about.json";

export const metadata: Metadata = {
  title: "About The Good Stay - Professional Dog Boarding",
  description:
    "Learn about our experienced team, our philosophy of care, and why we're passionate about providing the best possible experience for your dog.",
  keywords: [
    "about dog boarding",
    "pet care experience",
    "dog boarding philosophy",
    "professional pet care",
    "dog boarding team",
  ],
  openGraph: {
    title: "About The Good Stay - Professional Dog Boarding",
    description:
      "Learn about our experienced team and our philosophy of care for your beloved pets.",
    url: "https://thegoodstay.vercel.app/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navigation />
      <main className="pt-20 md:pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-amber-50 to-stone-100 py-24">
          <div className="max-w-4xl mx-auto px-8 lg:px-12 text-center">
            <h1 className="font-crimson text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-stone-900 mb-8 leading-tight">
              {aboutData.hero.title}
            </h1>
            <p className="font-lora text-xl md:text-2xl text-stone-700 mb-8 leading-relaxed">
              {aboutData.hero.subtitle}
            </p>
          </div>
        </section>

        {/* Story Sections */}
        {aboutData.sections.map((section, index) => (
          <section
            key={index}
            className={`py-24 ${index % 2 === 0 ? "bg-white" : "bg-stone-50"}`}
          >
            <div className="max-w-7xl mx-auto px-8 lg:px-12">
              <div
                className={`grid lg:grid-cols-2 gap-16 lg:gap-24 items-center ${
                  section.layout === "image-left"
                    ? ""
                    : "lg:grid-flow-col-dense"
                }`}
              >
                <div
                  className={
                    section.layout === "image-left"
                      ? "lg:order-2"
                      : "lg:order-1"
                  }
                >
                  <h2 className="font-crimson text-4xl md:text-5xl font-normal text-stone-900 mb-8">
                    {section.title}
                  </h2>
                  <p className="font-lora text-lg text-stone-700 leading-relaxed">
                    {section.content}
                  </p>
                </div>

                <div
                  className={
                    section.layout === "image-left"
                      ? "lg:order-1"
                      : "lg:order-2"
                  }
                >
                  <div className="aspect-[4/5] bg-stone-200 rounded-lg overflow-hidden">
                    {/* Placeholder for image */}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* Stats Section */}
        <section className="py-24 bg-amber-50">
          <div className="max-w-7xl mx-auto px-8 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="font-crimson text-4xl md:text-5xl font-normal text-stone-900 mb-6">
                By the Numbers
              </h2>
              <div className="w-24 h-px bg-amber-600 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {aboutData.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="font-crimson text-5xl md:text-6xl font-normal text-stone-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="font-lora text-lg text-stone-700">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-8 lg:px-12 text-center">
            <blockquote className="font-lora  text-stone-700 italic leading-relaxed mb-8">
              "{aboutData.testimonial.quote}"
            </blockquote>
            <cite className="font-lora text-lg text-stone-600 not-italic">
              — {aboutData.testimonial.author}, {aboutData.testimonial.role}
            </cite>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-amber-50">
          <div className="max-w-4xl mx-auto px-8 lg:px-12 text-center">
            <h2 className="font-crimson text-4xl md:text-5xl font-normal text-stone-900 mb-8">
              Ready to meet us?
            </h2>
            <p className="font-lora text-lg text-stone-700 mb-12">
              Schedule your complimentary assessment visit and see why families
              choose The Good Stay
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
  );
}
