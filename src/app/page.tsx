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
    <div className="min-h-screen bg-[#fafafa] overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center bg-[#19171b] overflow-hidden">
        {/* Slideshow de imágenes de modelos */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {heroImages.map((img, idx) => (
            <img
              key={img}
              src={img}
              alt={`Modelo VELVET ${idx + 1}`}
              className={`w-full h-full object-cover object-center absolute inset-0 transition-opacity duration-1000 ${idx === currentHero ? 'opacity-100' : 'opacity-0'}`}
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
        <div className="relative z-20 text-center text-white container-responsive safe-area-padding">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 tracking-tight">
            <span className="text-white drop-shadow-lg">VEL</span>
            <span className="bg-gradient-to-r from-[#ff3b4a] via-[#B32134] to-[#490000] bg-clip-text text-transparent drop-shadow-lg">VET</span>
          </h1>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-[#B32134] via-[#51080d] to-[#2b0307] mx-auto my-6 sm:my-8"></div>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 font-light max-w-3xl mx-auto">
            Elegancia redefinida para el mundo moderno
          </p>
          <p className="text-[#d1d1d1] mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
            Descubre nuestra colección exclusiva de moda premium. 
            Cada pieza está cuidadosamente seleccionada para reflejar 
            tu estilo único y sofisticado.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link
              href="/shop"
              className="relative overflow-hidden bg-transparent border border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-sm font-medium group transition-all duration-300 min-h-[48px] flex items-center justify-center"
            >
              <span className="relative z-10">Explorar Colección</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#B32134] to-[#2b0307] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
            <Link
              href="/shop?featured=true"
              className="relative overflow-hidden bg-white text-[#19171b] px-6 sm:px-8 py-3 sm:py-4 rounded-sm font-medium group transition-all duration-300 hover:text-white min-h-[48px] flex items-center justify-center"
            >
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">Ver Destacados</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#B32134] to-[#51080d] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
          </div>
        </div>

        {/* FLECHITA */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-30 safe-area-padding-bottom">
          <div className="animate-bounce">
            <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none">
              <defs>
                <filter id="dropshadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.4"/>
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
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-[#fafafa]">
        <div className="container-responsive">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-responsive-3xl sm:text-responsive-4xl font-bold text-[#19171b] mb-4">
              Productos Destacados
            </h2>
            <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-[#B32134] via-[#51080d] to-[#2b0307] mx-auto my-6 sm:my-8"></div>
            <p className="text-[#666] max-w-2xl mx-auto font-light text-sm sm:text-base">
              Una selección especial de nuestras piezas más populares y elegantes
            </p>
          </div>

          {loading ? (
            <div className="grid grid-responsive-4 gap-4 sm:gap-6 lg:gap-8">
              {Array.from({ length: 4 }, (_, index) => ({ id: `featured-skeleton-${index}`, index })).map(({ id }) => (
                <div key={id} className="animate-pulse">
                  <div className="bg-[#eee] aspect-[3/4] rounded-sm mb-4" />
                  <div className="h-4 bg-[#eee] rounded-sm mb-2" />
                  <div className="h-4 bg-[#eee] rounded-sm w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-responsive-4 gap-4 sm:gap-6 lg:gap-8">
              {featuredProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  priority={index < 4} // Solo las primeras 4 imágenes tienen priority
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12 sm:mt-16 lg:mt-20">
            <Link
              href="/shop"
              className="inline-flex items-center border border-[#19171b] text-[#19171b] px-6 sm:px-8 py-3 rounded-sm font-medium hover:bg-[#19171b] hover:text-white transition-colors duration-300 min-h-[48px]"
            >
              Ver Todos los Productos
              <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="container-responsive">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-responsive-3xl sm:text-responsive-4xl font-bold text-[#19171b] mb-4">
              Explora por Categoría
            </h2>
            <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-[#B32134] via-[#51080d] to-[#2b0307] mx-auto my-6 sm:my-8"></div>
            <p className="text-[#666] max-w-2xl mx-auto font-light text-sm sm:text-base">
              Encuentra exactamente lo que buscas en nuestras categorías especializadas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Mujer */}
            <Link href="/shop?category=women" className="group relative overflow-hidden h-[300px] sm:h-[350px] lg:h-[400px] bg-white border border-[#eee] hover:border-[#75020f]/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-b from-white to-[#f5f5f5]"></div>
              <div className="relative h-full flex flex-col justify-center items-center text-center p-6 sm:p-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f0f0f0] rounded-full flex items-center justify-center mb-4 sm:mb-6">
                  <span className="text-xl sm:text-2xl">👗</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#19171b] mb-2">Mujer</h3>
                <p className="text-[#666] mb-6 sm:mb-8 text-sm sm:text-base">Elegancia femenina</p>
                <span className="text-sm text-[#75020f] font-medium tracking-widest group-hover:underline">EXPLORAR</span>
              </div>
            </Link>

            {/* Hombre */}
            <Link href="/shop?category=men" className="group relative overflow-hidden h-[300px] sm:h-[350px] lg:h-[400px] bg-white border border-[#eee] hover:border-[#75020f]/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-b from-white to-[#f5f5f5]"></div>
              <div className="relative h-full flex flex-col justify-center items-center text-center p-6 sm:p-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f0f0f0] rounded-full flex items-center justify-center mb-4 sm:mb-6">
                  <span className="text-xl sm:text-2xl">👔</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#19171b] mb-2">Hombre</h3>
                <p className="text-[#666] mb-6 sm:mb-8 text-sm sm:text-base">Estilo masculino</p>
                <span className="text-sm text-[#75020f] font-medium tracking-widest group-hover:underline">EXPLORAR</span>
              </div>
            </Link>

            {/* Accesorios */}
            <Link href="/shop?category=accessories" className="group relative overflow-hidden h-[300px] sm:h-[350px] lg:h-[400px] bg-white border border-[#eee] hover:border-[#75020f]/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-b from-white to-[#f5f5f5]"></div>
              <div className="relative h-full flex flex-col justify-center items-center text-center p-6 sm:p-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f0f0f0] rounded-full flex items-center justify-center mb-4 sm:mb-6">
                  <span className="text-xl sm:text-2xl">👜</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#19171b] mb-2">Accesorios</h3>
                <p className="text-[#666] mb-6 sm:mb-8 text-sm sm:text-base">Complementos perfectos</p>
                <span className="text-sm text-[#75020f] font-medium tracking-widest group-hover:underline">EXPLORAR</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-[#19171b] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')]"></div>
        
        <div className="container-responsive relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-responsive-3xl sm:text-responsive-4xl font-bold mb-4 sm:mb-6">
              Mantente al Día con VELVET
            </h2>
            <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-[#B32134] via-[#51080d] to-[#2b0307] mx-auto my-6 sm:my-8"></div>
            <p className="text-[#d1d1d1] mb-8 sm:mb-10 text-base sm:text-lg font-light max-w-2xl mx-auto">
              Sé el primero en conocer nuestras nuevas colecciones, ofertas exclusivas y eventos especiales
            </p>
            
            <form className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Tu dirección de email"
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-sm bg-transparent border border-[#555] text-white placeholder-[#999] focus:outline-none focus:border-[#75020f] transition-colors text-base"
                required
              />
              <button
                type="submit"
                className="bg-[#75020f] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-sm font-medium hover:bg-[#51080d] transition-colors whitespace-nowrap min-h-[48px]"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-[#fafafa] border-t border-[#eee]">
        <div className="container-responsive">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center px-4 sm:px-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f0f0f0] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#75020f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-[#19171b]">Envío Gratis</h3>
              <p className="text-[#666] font-light text-sm sm:text-base">En compras mayores a $100 USD</p>
            </div>

            <div className="text-center px-4 sm:px-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f0f0f0] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#75020f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-[#19171b]">Calidad Garantizada</h3>
              <p className="text-[#666] font-light text-sm sm:text-base">Productos premium seleccionados</p>
            </div>

            <div className="text-center px-4 sm:px-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f0f0f0] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#75020f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-[#19171b]">Devoluciones Fáciles</h3>
              <p className="text-[#666] font-light text-sm sm:text-base">30 días para cambios y devoluciones</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};