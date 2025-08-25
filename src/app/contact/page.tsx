// @ts-nocheck
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Metadata } from "next";
import contactData from "@/data/contact.json";

export const metadata: Metadata = {
  title: "Contact The Good Stay - Book Your Assessment Visit",
  description:
    "Get in touch to schedule your complimentary assessment visit or ask questions about our dog boarding services. We're here to help!",
  keywords: [
    "contact dog boarding",
    "book assessment visit",
    "pet care contact",
    "dog boarding inquiry",
    "schedule visit",
  ],
  openGraph: {
    title: "Contact The Good Stay - Book Your Assessment Visit",
    description:
      "Ready to schedule your complimentary assessment visit? Get in touch with us today!",
    url: "https://thegoodstay.vercel.app/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navigation />
      <main className="pt-20 md:pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-amber-50 to-stone-100 py-24">
          <div className="max-w-4xl mx-auto px-8 lg:px-12 text-center">
            <h1 className="font-crimson text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-stone-900 mb-8 leading-tight">
              {contactData.hero.title}
            </h1>
            <p className="font-lora text-xl md:text-2xl text-stone-700 mb-8 leading-relaxed">
              {contactData.hero.subtitle}
            </p>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-8 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
              {/* Contact Form */}
              <div>
                <div className="text-center mb-12">
                  <h2 className="font-crimson text-3xl md:text-4xl font-normal text-stone-900 mb-6">
                    {contactData.form.title}
                  </h2>
                  <div className="w-24 h-px bg-amber-600 mx-auto"></div>
                </div>

                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-lora text-sm font-medium text-stone-700 mb-2">
                        {contactData.form.fields[0].label}
                      </label>
                      <input
                        type={contactData.form.fields[0].type}
                        className="w-full px-6 py-4 bg-stone-50 border-2 border-stone-200 focus:border-stone-800 outline-none font-lora transition-colors rounded"
                        placeholder={contactData.form.fields[0].placeholder}
                        required={contactData.form.fields[0].required}
                      />
                    </div>
                    <div>
                      <label className="block font-lora text-sm font-medium text-stone-700 mb-2">
                        {contactData.form.fields[1].label}
                      </label>
                      <input
                        type={contactData.form.fields[1].type}
                        className="w-full px-6 py-4 bg-stone-50 border-2 border-stone-200 focus:border-stone-800 outline-none font-lora transition-colors rounded"
                        placeholder={contactData.form.fields[1].placeholder}
                        required={contactData.form.fields[1].required}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-lora text-sm font-medium text-stone-700 mb-2">
                        {contactData.form.fields[2].label}
                      </label>
                      <input
                        type={contactData.form.fields[2].type}
                        className="w-full px-6 py-4 bg-stone-50 border-2 border-stone-200 focus:border-stone-800 outline-none font-lora transition-colors rounded"
                        placeholder={contactData.form.fields[2].placeholder}
                      />
                    </div>
                    <div>
                      <label className="block font-lora text-sm font-medium text-stone-700 mb-2">
                        {contactData.form.fields[3].label}
                      </label>
                      <input
                        type={contactData.form.fields[3].type}
                        className="w-full px-6 py-4 bg-stone-50 border-2 border-stone-200 focus:border-stone-800 outline-none font-lora transition-colors rounded"
                        placeholder={contactData.form.fields[3].placeholder}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-lora text-sm font-medium text-stone-700 mb-2">
                      {contactData.form.fields[4].label}
                    </label>
                    <select className="w-full px-6 py-4 bg-stone-50 border-2 border-stone-200 focus:border-stone-800 outline-none font-lora transition-colors rounded">
                      {contactData.form.fields[4].options.map(
                        (option, index) => (
                          <option key={index}>{option}</option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block font-lora text-sm font-medium text-stone-700 mb-2">
                      {contactData.form.fields[5].label}
                    </label>
                    <textarea
                      rows={contactData.form.fields[5].rows}
                      className="w-full px-6 py-4 bg-stone-50 border-2 border-stone-200 focus:border-stone-800 outline-none font-lora transition-colors resize-none rounded"
                      placeholder={contactData.form.fields[5].placeholder}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-stone-800 text-amber-50 py-4 px-8 font-lora font-medium tracking-wide uppercase hover:bg-stone-700 transition-colors shadow-lg hover:shadow-xl rounded"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div>
                <div className="text-center mb-12">
                  <h2 className="font-crimson text-3xl md:text-4xl font-normal text-stone-900 mb-6">
                    Get in touch
                  </h2>
                  <div className="w-24 h-px bg-amber-600 mx-auto"></div>
                </div>

                <div className="space-y-8">
                  <div className="p-6 bg-stone-50 rounded-lg">
                    <h3 className="font-lora text-lg font-medium text-stone-900 mb-2">
                      {contactData.contactInfo.phone.title}
                    </h3>
                    <p className="font-lora text-stone-700">
                      {contactData.contactInfo.phone.value}
                    </p>
                  </div>

                  <div className="p-6 bg-stone-50 rounded-lg">
                    <h3 className="font-lora text-lg font-medium text-stone-900 mb-2">
                      {contactData.contactInfo.email.title}
                    </h3>
                    <p className="font-lora text-stone-700">
                      {contactData.contactInfo.email.value}
                    </p>
                  </div>

                  <div className="p-6 bg-stone-50 rounded-lg">
                    <h3 className="font-lora text-lg font-medium text-stone-900 mb-2">
                      {contactData.contactInfo.location.title}
                    </h3>
                    <p className="font-lora text-stone-700 whitespace-pre-line">
                      {contactData.contactInfo.location.value}
                    </p>
                  </div>

                  <div className="p-6 bg-stone-50 rounded-lg">
                    <h3 className="font-lora text-lg font-medium text-stone-900 mb-2">
                      {contactData.contactInfo.hours.title}
                    </h3>
                    <p className="font-lora text-stone-700 whitespace-pre-line">
                      {contactData.contactInfo.hours.value}
                    </p>
                  </div>

                  <div className="p-6 bg-stone-50 rounded-lg">
                    <h3 className="font-lora text-lg font-medium text-stone-900 mb-4">
                      {contactData.social.title}
                    </h3>
                    <div className="flex space-x-6">
                      {contactData.social.links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          className="text-stone-600 hover:text-stone-900 transition-colors font-lora"
                        >
                          {link.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-amber-50">
          <div className="max-w-4xl mx-auto px-8 lg:px-12 text-center">
            <h2 className="font-crimson text-4xl md:text-5xl font-normal text-stone-900 mb-6">
              {contactData.cta.title}
            </h2>
            <p className="font-lora text-lg text-stone-700 mb-12">
              {contactData.cta.subtitle}
            </p>
            <a
              href={contactData.cta.button.url}
              className="inline-block bg-stone-800 text-amber-50 px-12 py-6 font-lora font-medium tracking-wide uppercase hover:bg-stone-700 transition-colors shadow-lg hover:shadow-xl rounded"
            >
              {contactData.cta.button.text}
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
