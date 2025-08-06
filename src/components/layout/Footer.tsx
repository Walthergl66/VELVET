import React from 'react';
import Link from 'next/link';

/**
 * Componente Footer para la tienda VELVET
 * Incluye enlaces útiles, información de contacto y redes sociales
 */

const Footer: React.FC = () => {
  return (
  <footer className="bg-black/90 backdrop-blur-md text-white border-t border-gray-700/50">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {/* Brand Information */}
        <div className="space-y-6">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-white/90 text-black px-3 py-1 font-bold text-xl tracking-wider rounded-lg group-hover:bg-white transition-all duration-300 shadow-lg">
              VELVET
            </div>
          </Link>
          <p className="text-gray-300/80 text-sm leading-relaxed">
            Tu destino para la moda más elegante y sofisticada. 
            Descubre piezas únicas que reflejan tu estilo personal.
          </p>
          <div className="flex space-x-5">
            {[
              { 
                name: 'Facebook', 
                href: 'https://facebook.com',
                icon: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z',
                color: 'bg-blue-600/20 hover:bg-blue-600/30'
              },
              { 
                name: 'Instagram', 
                href: 'https://instagram.com',
                icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
                color: 'bg-pink-600/20 hover:bg-pink-600/30'
              },
              { 
                name: 'Twitter', 
                href: 'https://twitter.com',
                icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
                color: 'bg-blue-400/20 hover:bg-blue-400/30'
              }
            ].map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${social.color} text-gray-300 hover:text-white transition-all duration-300 w-9 h-9 rounded-full flex items-center justify-center`}
                aria-label={social.name}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d={social.icon} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Shop Links */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold tracking-wider text-white/90">Explorar</h3>
          <ul className="space-y-3">
            {[
              { name: 'Todos los Productos', href: '/shop' },
              { name: 'Mujer', href: '/shop?category=women' },
              { name: 'Hombre', href: '/shop?category=men' },
              { name: 'Accesorios', href: '/shop?category=accessories' },
              { name: 'Nuevos Lanzamientos', href: '/shop?new=true' },
              { name: 'Colección Premium', href: '/shop?premium=true' }
            ].map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href} 
                  className="text-gray-300/80 hover:text-white transition-all duration-300 text-sm flex items-center group"
                >
                  <span className="w-2 h-0.5 bg-gray-500 rounded-full mr-3 group-hover:w-3 group-hover:bg-white transition-all duration-300"></span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Service */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold tracking-wider text-white/90">Servicio</h3>
          <ul className="space-y-3">
            {[
              { name: 'Contacto', href: '/servicio-al-cliente/contact' },
              { name: 'Envíos', href: '/servicio-al-cliente/envios' },
              { name: 'Guía de Tallas', href: '/servicio-al-cliente/guia-tallas' },
              //{ name: 'Cuidado de Prendas', href: '/servicio-al-cliente/cuidado-prendas' },
              { name: 'Preguntas Frecuentes', href: '/servicio-al-cliente/faq' }
            ].map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href} 
                  className="text-gray-300/80 hover:text-white transition-all duration-300 text-sm flex items-center group"
                >
                  <span className="w-2 h-0.5 bg-gray-500 rounded-full mr-3 group-hover:w-3 group-hover:bg-white transition-all duration-300"></span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Payment Methods & Copyright */}
      <div className="border-t border-gray-700/50 mt-12 pt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h4 className="text-xs uppercase tracking-wider mb-3 text-gray-400">Métodos de Pago</h4>
            <div className="flex flex-wrap gap-2">
              {['VISA', 'PAYPAL',].map((method) => (
                <div 
                  key={method}
                  className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                >
                  {method}
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-400/80 tracking-wide">
            <p>&copy; {new Date().getFullYear()} VELVET.</p>
          </div>
        </div>
      </div>
    </div>
  </footer>
);
};

export default Footer;
