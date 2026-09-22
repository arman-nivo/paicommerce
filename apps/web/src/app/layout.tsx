import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { JsonLd } from "@/components/site/json-ld";
import { SITE, absoluteUrl, loginUrl, signupUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "PaiCommerce — The e-commerce platform built for Bangladesh", template: "%s · PaiCommerce" },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "ecommerce Bangladesh",
    "online store builder",
    "bKash payment gateway",
    "Nagad",
    "SSLCommerz",
    "cash on delivery",
    "Steadfast courier",
    "Pathao courier",
    "Shopify alternative Bangladesh",
    "Zatiq alternative",
    "ecommerce website BD",
  ],
  openGraph: { type: "website", siteName: SITE.name, locale: "en_US", url: SITE.url },
  twitter: { card: "summary_large_image", site: "@paicommerce" },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:wght@500;600;700&family=Nunito:wght@600;700;800&display=swap"
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE.name,
            url: SITE.url,
            logo: absoluteUrl("/icon.svg"),
            email: SITE.email,
            address: { "@type": "PostalAddress", streetAddress: SITE.address, addressLocality: "Dhaka", addressCountry: "BD" },
            sameAs: Object.values(SITE.social),
          }}
        />
      </head>
      <body className="min-h-dvh bg-white text-slate-900 antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg">
          Skip to content
        </a>
        <SiteHeader signupHref={signupUrl()} loginHref={loginUrl} />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
