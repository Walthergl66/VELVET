'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { useProducts } from '@/hooks/useProducts';

/**
 * Página principal de la tienda VELVET
 * Incluye hero section, productos destacados y categorías principales
 */

export default function Home() {
  const { products: featuredProducts, loading } = useProducts({ 
    featured: true, 
    limit: 4 
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-black">
        <div className="absolute inset-0 bg-black/40 z-10" />
        
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-r from-gray-900 to-gray-700" />
        </div>

        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-wider">
            VEL<span className="text-gray-300">VET</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light">
            Elegancia redefinida para el mundo moderno
          </p>
          <p className="text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Descubre nuestra colección exclusiva de moda premium. 
            Cada pieza está cuidadosamente seleccionada para reflejar 
            tu estilo único y sofisticado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              Explorar Colección
            </Link>
            <Link
              href="/shop?featured=true"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-black transition-all duration-300"
            >
              Ver Destacados
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Productos Destacados
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Una selección especial de nuestras piezas más populares y elegantes
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 aspect-[3/4] rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-flex items-center bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Ver Todos los Productos
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explora por Categoría
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Encuentra exactamente lo que buscas en nuestras categorías especializadas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mujer */}
            <Link href="/shop?category=women" className="group relative overflow-hidden rounded-2xl">
              <div className="aspect-[4/5] bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">👗</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Mujer</h3>
                  <p className="text-gray-600">Elegancia femenina</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
            </Link>

            {/* Hombre */}
            <Link href="/shop?category=men" className="group relative overflow-hidden rounded-2xl">
              <div className="aspect-[4/5] bg-gradient-to-br from-blue-100 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">👔</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Hombre</h3>
                  <p className="text-gray-600">Estilo masculino</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
            </Link>

            {/* Accesorios */}
            <Link href="/shop?category=accessories" className="group relative overflow-hidden rounded-2xl">
              <div className="aspect-[4/5] bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">👜</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Accesorios</h3>
                  <p className="text-gray-600">Complementos perfectos</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Mantente al Día con VELVET
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Sé el primero en conocer nuestras nuevas colecciones, ofertas exclusivas y eventos especiales
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Tu dirección de email"
                className="flex-1 px-6 py-3 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
              <button
                type="submit"
                className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                Suscribirse
              </button>
            </form>
            
            <p className="text-gray-400 text-sm mt-4">
              Al suscribirte, aceptas recibir emails promocionales. Puedes darte de baja en cualquier momento.
            </p>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Envío Gratis</h3>
              <p className="text-gray-600">En compras mayores a $1,000 MXN</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Calidad Garantizada</h3>
              <p className="text-gray-600">Productos premium seleccionados</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Devoluciones Fáciles</h3>
              <p className="text-gray-600">30 días para cambios y devoluciones</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
