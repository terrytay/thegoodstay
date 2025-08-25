import type { Metadata } from "next";
import { Inter, Crimson_Text, Lora } from "next/font/google";
import "./globals.css";
import ClientWrapper from '@/components/client-wrapper';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const crimsonText = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thegoodstay.vercel.app"),
  title: {
    default: "The Good Stay - Professional Dog Boarding & Pet Care",
    template: "%s | The Good Stay",
  },
  description:
    "Professional dog boarding and pet care services with personalized attention. Book an assessment visit and shop for premium pet treats and accessories. Trusted by 200+ families.",
  keywords: [
    "dog boarding",
    "pet care",
    "dog sitter",
    "pet boarding",
    "dog treats",
    "pet accessories",
    "dog daycare",
    "pet services",
    "professional pet care",
    "dog boarding near me",
  ],
  authors: [{ name: "The Good Stay" }],
  creator: "The Good Stay",
  publisher: "The Good Stay",
  category: "Pet Care Services",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://thegoodstay.vercel.app",
    siteName: "The Good Stay",
    title: "The Good Stay - Professional Dog Boarding & Pet Care",
    description:
      "Professional dog boarding and pet care services with personalized attention. Trusted by 200+ families.",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "The Good Stay - Professional Dog Boarding",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@thegoodstay",
    creator: "@thegoodstay",
    title: "The Good Stay - Professional Dog Boarding & Pet Care",
    description:
      "Professional dog boarding and pet care services with personalized attention. Trusted by 200+ families.",
    images: ["/logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${crimsonText.variable} ${lora.variable} font-sans antialiased bg-stone-50`}
      >
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
