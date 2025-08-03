'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { useProducts } from '@/hooks/useProducts';

export default function Home() {
  const { products: featuredProducts, loading } = useProducts({ 
    featured: true, 
    limit: 4 
  });

  // Imágenes de modelos para el slideshow
  const heroImages = [
    '/Modelo1.jpg',
    '/Modelo2.avif',
    '/Modelo3.avif',
    '/Modelo4.jpg',
    '/Modelo5.jpg',
    '/Modelo6.jpg',
    '/Modelo7.jpg',
    '/Modelo8.avif',
    '/Modelo9.jpg',
    // Agrega más rutas según tus imágenes
  ];
  const [currentHero, setCurrentHero] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 3500); // Cambia cada 3.5 segundos
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-[#19171b] overflow-hidden">
        {/* Slideshow de imágenes de modelos */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {heroImages.map((img, idx) => (
            <img
              key={img}
              src={img}
              alt={`Modelo VELVET ${idx + 1}`}
              className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-1000 ${idx === currentHero ? 'opacity-100' : 'opacity-0'}`}
              draggable={false}
            />
          ))}
        </div>

        {/* Overlay negro muy transparente y blur para suavizar las imágenes */}
        <div className="absolute inset-0 z-5 bg-black/30 backdrop-blur-sm"></div>
        {/* Overlay de textura y gradientes */}
        <div className="absolute inset-0 z-20 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-10"></div>

        <div className="absolute inset-0 z-20 bg-gradient-to-br from-[#888888]/20 via-[#b0b0b0]/10 to-[#e0e0e0]/0"></div>

        {/* Contenido principal estático */}
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="text-white drop-shadow-lg">VEL</span>
            <span className="bg-gradient-to-r from-[#ff3b4a] via-[#B32134] to-[#490000] bg-clip-text text-transparent drop-shadow-lg">VET</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-[#B32134] via-[#51080d] to-[#2b0307] mx-auto my-8"></div>
          <p className="text-xl md:text-2xl mb-8 font-light">
            Elegancia redefinida para el mundo moderno
          </p>
          <p className="text-[#d1d1d1] mb-10 max-w-2xl mx-auto leading-relaxed">
            Descubre nuestra colección exclusiva de moda premium. 
            Cada pieza está cuidadosamente seleccionada para reflejar 
            tu estilo único y sofisticado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="relative overflow-hidden bg-transparent border border-white text-white px-8 py-4 rounded-sm font-medium group transition-all duration-300"
            >
              <span className="relative z-10">Explorar Colección</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#B32134] to-[#2b0307] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
            <Link
              href="/shop?featured=true"
              className="relative overflow-hidden bg-white text-[#19171b] px-8 py-4 rounded-sm font-medium group transition-all duration-300 hover:text-white"
            >
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">Ver Destacados</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#B32134] to-[#51080d] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
          </div>
        </div>

        {/* FLECHITA */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
          <div className="animate-bounce">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
              <defs>
                <filter id="dropshadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.4"/>
                </filter>
              </defs>
              <path
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#dropshadow)"
              />
              <path
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                stroke="url(#shine)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.5"
              />
              <linearGradient id="shine" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fff" stopOpacity="0.8" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </svg>
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-24 bg-[#fafafa]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#19171b] mb-4">
              Productos Destacados
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B32134] via-[#51080d] to-[#2b0307] mx-auto my-8"></div>
            <p className="text-[#666] max-w-2xl mx-auto font-light">
              Una selección especial de nuestras piezas más populares y elegantes
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }, (_, index) => ({ id: `featured-skeleton-${index}`, index })).map(({ id }) => (
                <div key={id} className="animate-pulse">
                  <div className="bg-[#eee] aspect-[3/4] rounded-sm mb-4" />
                  <div className="h-4 bg-[#eee] rounded-sm mb-2" />
                  <div className="h-4 bg-[#eee] rounded-sm w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  priority={index < 4} // Solo las primeras 4 imágenes tienen priority
                />
              ))}
            </div>
          )}

          <div className="text-center mt-20">
            <Link
              href="/shop"
              className="inline-flex items-center border border-[#19171b] text-[#19171b] px-8 py-3 rounded-sm font-medium hover:bg-[#19171b] hover:text-white transition-colors duration-300"
            >
              Ver Todos los Productos
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#19171b] mb-4">
              Explora por Categoría
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B32134] via-[#51080d] to-[#2b0307] mx-auto my-8"></div>
            <p className="text-[#666] max-w-2xl mx-auto font-light">
              Encuentra exactamente lo que buscas en nuestras categorías especializadas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mujer */}
            <Link href="/shop?category=women" className="group relative overflow-hidden h-[400px] bg-white border border-[#eee] hover:border-[#75020f]/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-b from-white to-[#f5f5f5]"></div>
              <div className="relative h-full flex flex-col justify-center items-center text-center p-8">
                <div className="w-20 h-20 bg-[#f0f0f0] rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl">👗</span>
                </div>
                <h3 className="text-2xl font-bold text-[#19171b] mb-2">Mujer</h3>
                <p className="text-[#666] mb-8">Elegancia femenina</p>
                <span className="text-sm text-[#75020f] font-medium tracking-widest group-hover:underline">EXPLORAR</span>
              </div>
            </Link>

            {/* Hombre */}
            <Link href="/shop?category=men" className="group relative overflow-hidden h-[400px] bg-white border border-[#eee] hover:border-[#75020f]/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-b from-white to-[#f5f5f5]"></div>
              <div className="relative h-full flex flex-col justify-center items-center text-center p-8">
                <div className="w-20 h-20 bg-[#f0f0f0] rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl">👔</span>
                </div>
                <h3 className="text-2xl font-bold text-[#19171b] mb-2">Hombre</h3>
                <p className="text-[#666] mb-8">Estilo masculino</p>
                <span className="text-sm text-[#75020f] font-medium tracking-widest group-hover:underline">EXPLORAR</span>
              </div>
            </Link>

            {/* Accesorios */}
            <Link href="/shop?category=accessories" className="group relative overflow-hidden h-[400px] bg-white border border-[#eee] hover:border-[#75020f]/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-b from-white to-[#f5f5f5]"></div>
              <div className="relative h-full flex flex-col justify-center items-center text-center p-8">
                <div className="w-20 h-20 bg-[#f0f0f0] rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl">👜</span>
                </div>
                <h3 className="text-2xl font-bold text-[#19171b] mb-2">Accesorios</h3>
                <p className="text-[#666] mb-8">Complementos perfectos</p>
                <span className="text-sm text-[#75020f] font-medium tracking-widest group-hover:underline">EXPLORAR</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-[#19171b] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')]"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Mantente al Día con VELVET
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#B32134] via-[#51080d] to-[#2b0307] mx-auto my-8"></div>
            <p className="text-[#d1d1d1] mb-10 text-lg font-light max-w-2xl mx-auto">
              Sé el primero en conocer nuestras nuevas colecciones, ofertas exclusivas y eventos especiales
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Tu dirección de email"
                className="flex-1 px-6 py-4 rounded-sm bg-transparent border border-[#555] text-white placeholder-[#999] focus:outline-none focus:border-[#75020f] transition-colors"
                required
              />
              <button
                type="submit"
                className="bg-[#75020f] text-white px-8 py-4 rounded-sm font-medium hover:bg-[#51080d] transition-colors whitespace-nowrap"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-24 bg-[#fafafa] border-t border-[#eee]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center px-6">
              <div className="w-20 h-20 bg-[#f0f0f0] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[#75020f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-[#19171b]">Envío Gratis</h3>
              <p className="text-[#666] font-light">En compras mayores a $1,000 MXN</p>
            </div>

            <div className="text-center px-6">
              <div className="w-20 h-20 bg-[#f0f0f0] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[#75020f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-[#19171b]">Calidad Garantizada</h3>
              <p className="text-[#666] font-light">Productos premium seleccionados</p>
            </div>

            <div className="text-center px-6">
              <div className="w-20 h-20 bg-[#f0f0f0] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[#75020f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-[#19171b]">Devoluciones Fáciles</h3>
              <p className="text-[#666] font-light">30 días para cambios y devoluciones</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};