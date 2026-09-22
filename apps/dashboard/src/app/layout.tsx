import type { Metadata, Viewport } from "next";
import { Toaster } from "@pai/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "PaiCommerce", template: "%s · PaiCommerce" },
  description: "Run your online store — orders, products, themes and more.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#2545eb" };

const themeScript = `(function(){try{var t=localStorage.getItem('pai-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-dvh">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
