import type { Metadata, Viewport } from "next";
import { Toaster } from "@pai/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "PaiCommerce Admin", template: "%s · PaiCommerce Admin" },
  description: "Platform administration for PaiCommerce",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0d16" },
  ],
};

const themeScript = `(function(){try{var t=localStorage.getItem("pai-admin-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;

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
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
