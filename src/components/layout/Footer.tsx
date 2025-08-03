import React from 'react';
import Link from 'next/link';

/**
 * Componente Footer para la tienda VELVET
 * Incluye enlaces útiles, información de contacto y redes sociales
 */

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Información de la marca */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-white text-black px-3 py-1 font-bold text-xl tracking-wider">
                VELVET
              </div>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Tu destino para la moda más elegante y sofisticada. 
              Descubre piezas únicas que reflejan tu estilo personal.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.329-1.297L6.891 14.7c.555.555 1.317.888 2.153.888 1.63 0 2.967-1.297 2.967-2.927S10.674 9.734 9.044 9.734c-.836 0-1.598.333-2.153.888L5.12 9.631c.881-.807 2.032-1.297 3.329-1.297 2.967 0 5.379 2.412 5.379 5.379s-2.412 5.375-5.379 5.375z"/>
                </svg>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Enlaces de la tienda */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tienda</h3>
            <ul className="space-y-2">
              <li><Link href="/shop" className="text-gray-300 hover:text-white transition-colors text-sm">Todos los Productos</Link></li>
              <li><Link href="/shop?category=women" className="text-gray-300 hover:text-white transition-colors text-sm">Mujer</Link></li>
              <li><Link href="/shop?category=men" className="text-gray-300 hover:text-white transition-colors text-sm">Hombre</Link></li>
              <li><Link href="/shop?category=accessories" className="text-gray-300 hover:text-white transition-colors text-sm">Accesorios</Link></li>
              <li><Link href="/shop?featured=true" className="text-gray-300 hover:text-white transition-colors text-sm">Destacados</Link></li>
              <li><Link href="/shop?sale=true" className="text-gray-300 hover:text-white transition-colors text-sm">Ofertas</Link></li>
            </ul>
          </div>

          {/* Servicio al cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Servicio al Cliente</h3>
            <ul className="space-y-2">
              <li><Link href="/servicio-al-cliente/contact" className="text-gray-300 hover:text-white transition-colors text-sm">Contacto</Link></li>
              <li><Link href="/servicio-al-cliente/envios" className="text-gray-300 hover:text-white transition-colors text-sm">Envíos</Link></li>
              <li><Link href="/user/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">Mi Cuenta</Link></li>
              <li><Link href="/help/returns" className="text-gray-300 hover:text-white transition-colors text-sm">Devoluciones</Link></li>
              <li><Link href="/help/size-guide" className="text-gray-300 hover:text-white transition-colors text-sm">Guía de Tallas</Link></li>
              <li><Link href="/help/faq" className="text-gray-300 hover:text-white transition-colors text-sm">Preguntas Frecuentes</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Mantente Informado</h3>
            <p className="text-gray-300 text-sm">
              Suscríbete para recibir ofertas exclusivas y novedades.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Tu email"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              />
              <button
                type="submit"
                className="w-full bg-white text-black py-2 rounded-md font-medium hover:bg-gray-200 transition-colors"
              >
                Suscribirse
              </button>
            </form>
            <div className="space-y-2 text-sm text-gray-300">
              <h4 className="font-medium">Información de Contacto</h4>
              <p>📧 contacto@velvet.com</p>
              <p>📞 +52 55 1234 5678</p>
              <p>📍 Ciudad de México, México</p>
            </div>
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h4 className="text-sm font-medium mb-2">Métodos de Pago Aceptados</h4>
              <div className="flex space-x-4">
                <div className="bg-white p-1 rounded">
                  <span className="text-black text-xs font-bold">VISA</span>
                </div>
                <div className="bg-white p-1 rounded">
                  <span className="text-black text-xs font-bold">MC</span>
                </div>
                <div className="bg-white p-1 rounded">
                  <span className="text-black text-xs font-bold">AMEX</span>
                </div>
                <div className="bg-blue-600 p-1 rounded">
                  <span className="text-white text-xs font-bold">PayPal</span>
                </div>
                <div className="bg-green-500 p-1 rounded">
                  <span className="text-white text-xs font-bold">MP</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-300">
              <p>&copy; 2025 VELVET. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
