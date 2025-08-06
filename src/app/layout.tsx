import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "VELVET - Elegancia Textil Redefinida",
  description: "Descubre nuestra colección exclusiva donde cada hilo cuenta una historia de artesanía y sofisticación.",
  keywords: "moda, ropa, elegante, sofisticada, hombre, mujer, accesorios, premium, textil, artesanía",
  authors: [{ name: "VELVET" }],
  openGraph: {
    title: "VELVET - Elegancia Textil Redefinida",
    description: "Descubre nuestra colección exclusiva donde cada hilo cuenta una historia de artesanía y sofisticación.",
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VELVET Colección Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VELVET - Elegancia Textil Redefinida",
    description: "Descubre nuestra colección exclusiva donde cada hilo cuenta una historia de artesanía y sofisticación.",
    images: ["/twitter-image.jpg"],
  },
  themeColor: "#1b1717ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1b1717ff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} antialiased bg-[#fafafa] text-[#19171b] overflow-x-hidden`}>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}