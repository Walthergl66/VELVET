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
  title: "VELVET - Moda Elegante y Sofisticada",
  description: "Descubre la colección más elegante de ropa y accesorios en VELVET. Moda de calidad premium para hombres y mujeres.",
  keywords: "moda, ropa, elegante, sofisticada, hombre, mujer, accesorios, premium",
  authors: [{ name: "VELVET" }],
  openGraph: {
    title: "VELVET - Moda Elegante y Sofisticada",
    description: "Descubre la colección más elegante de ropa y accesorios en VELVET.",
    type: "website",
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title: "VELVET - Moda Elegante y Sofisticada",
    description: "Descubre la colección más elegante de ropa y accesorios en VELVET.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
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
