'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Interfaces para TypeScript
interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface FAQCategory {
  id: string;
  name: string;
  icon: string;
}

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const categories: FAQCategory[] = [
    { id: 'general', name: 'General', icon: '❓' },
    { id: 'pedidos', name: 'Pedidos', icon: '🛒' },
    { id: 'envios', name: 'Envíos', icon: '📦' },
    { id: 'devoluciones', name: 'Devoluciones', icon: '↩️' },
    { id: 'pagos', name: 'Pagos', icon: '💳' },
    { id: 'productos', name: 'Productos', icon: '👕' },
  ];

  const faqItems: FAQItem[] = [
    // General
    { id: 1, category: 'general', question: '¿Cuáles son los horarios de atención?', answer: 'Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00, sábados de 10:00 a 16:00. Los domingos permanecemos cerrados.' },
    { id: 2, category: 'general', question: '¿Cómo puedo contactar al servicio al cliente?', answer: 'Puedes contactarnos por email a contacto@velvet.com, por teléfono al +52 55 1234 5678, o a través del formulario de contacto en nuestra página web.' },
    { id: 3, category: 'general', question: '¿Tienen tienda física?', answer: 'Actualmente somos una tienda en línea. Sin embargo, planeamos abrir una tienda física en Ciudad de México próximamente.' },
    
    // Pedidos
    { id: 4, category: 'pedidos', question: '¿Cómo realizo un pedido?', answer: 'Para realizar un pedido, navega por nuestros productos, añade los artículos deseados al carrito y procede al checkout. Necesitarás crear una cuenta o iniciar sesión.' },
    { id: 5, category: 'pedidos', question: '¿Puedo modificar mi pedido después de realizarlo?', answer: 'Sí, puedes modificar tu pedido dentro de las primeras 2 horas después de haberlo realizado, siempre que no haya sido procesado aún. Contacta a nuestro servicio al cliente.' },
    { id: 6, category: 'pedidos', question: '¿Cómo puedo rastrear mi pedido?', answer: 'Una vez que tu pedido sea procesado, recibirás un número de seguimiento por email. También puedes verificar el estado en tu cuenta de usuario en la sección "Mis Pedidos".' },
    { id: 7, category: 'pedidos', question: '¿Cuánto tiempo tarda en procesarse un pedido?', answer: 'Los pedidos se procesan en un plazo de 1-2 días hábiles. Una vez procesado, recibirás la información de envío.' },
    
    // Envíos
    { id: 8, category: 'envios', question: '¿Cuáles son los costos de envío?', answer: 'Los costos de envío varían según el destino y peso del paquete. El envío estándar dentro de Ecuador cuesta $15 USD, y a zonas rurales desde $25 USD. Envíos gratuitos en compras mayores a $100 USD.' },
    { id: 9, category: 'envios', question: '¿Cuánto tiempo tarda la entrega?', answer: 'Ciudades principales (Quito, Guayaquil, Cuenca): 1-2 días hábiles. Otras ciudades: 3-5 días hábiles. Zonas rurales: 5-7 días hábiles.' },
    { id: 10, category: 'envios', question: '¿Hacen entregas los fines de semana?', answer: 'Las entregas se realizan de lunes a viernes. Los fines de semana no hay entregas, excepto en casos especiales que se coordinan previamente.' },
    { id: 11, category: 'envios', question: '¿Puedo cambiar la dirección de entrega?', answer: 'Sí, puedes cambiar la dirección antes de que el paquete sea enviado. Una vez en tránsito, el cambio dependerá de la paquetería.' },
    
    // Devoluciones
    { id: 12, category: 'devoluciones', question: '¿Cuál es la política de devoluciones?', answer: 'Aceptamos devoluciones dentro de 30 días posteriores a la compra. El producto debe estar en estado original, con etiquetas y empaque.' },
    { id: 13, category: 'devoluciones', question: '¿Quién paga el envío de devolución?', answer: 'Si el producto tiene defecto o error de nuestra parte, cubrimos el costo. Si es por cambio de opinión, el cliente cubre el envío.' },
    { id: 14, category: 'devoluciones', question: '¿Cuánto tardan los reembolsos?', answer: 'Los reembolsos se procesan en 5-7 días hábiles una vez que recibimos y verificamos el producto devuelto.' },
    { id: 15, category: 'devoluciones', question: '¿Puedo cambiar por otra talla?', answer: 'Sí, ofrecemos cambios por talla diferente sujeto a disponibilidad. El proceso es similar a una devolución.' },
    
    // Pagos
    { id: 16, category: 'pagos', question: '¿Qué métodos de pago aceptan?', answer: 'Aceptamos tarjetas de crédito y débito (Visa, MasterCard, American Express), PayPal, transferencias bancarias y pagos en efectivo en tiendas OXXO.' },
    { id: 17, category: 'pagos', question: '¿Es seguro comprar en su sitio?', answer: 'Sí, nuestro sitio utiliza encriptación SSL y procesamos los pagos a través de plataformas seguras certificadas.' },
    { id: 18, category: 'pagos', question: '¿Puedo pagar a meses sin intereses?', answer: 'Sí, ofrecemos pagos a 3, 6 y 12 meses sin intereses con tarjetas participantes de bancos afiliados.' },
    { id: 19, category: 'pagos', question: '¿Emiten factura?', answer: 'Sí, podemos emitir facturas fiscales. Solicítala durante el proceso de compra o contacta a nuestro servicio al cliente.' },
    
    // Productos
    { id: 20, category: 'productos', question: '¿Cómo sé qué talla elegir?', answer: 'Consulta nuestra guía de tallas en cada producto o en la sección de servicio al cliente. También puedes contactarnos para asesoría personalizada.' },
    { id: 21, category: 'productos', question: '¿Los colores se ven igual que en las fotos?', answer: 'Nos esforzamos por mostrar colores precisos, pero pueden variar ligeramente debido a configuraciones de pantalla. En caso de diferencia significativa, aceptamos devoluciones.' },
    { id: 22, category: 'productos', question: '¿Tienen productos en tallas grandes?', answer: 'Sí, manejamos tallas desde XS hasta XXL en la mayoría de nuestros productos. Algunas piezas están disponibles en tallas especiales.' },
    { id: 23, category: 'productos', question: '¿Cómo cuido mis prendas VELVET?', answer: 'Cada prenda incluye instrucciones de cuidado en su etiqueta. En general, recomendamos lavado suave y secado a la sombra para preservar la calidad.' },
  ];

  const toggleExpanded = (itemId: number) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const filteredFAQs = faqItems.filter(item => {
    const matchesCategory = selectedCategory === 'general' ? true : item.category === selectedCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navegación de servicio al cliente */}
        <div className="flex justify-center mb-8">
          <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            <Link 
              href="/servicio-al-cliente/contact" 
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Contacto
            </Link>
            <Link 
              href="/servicio-al-cliente/envios" 
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Envíos
            </Link>
            <Link 
              href="/servicio-al-cliente/devoluciones" 
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Devoluciones
            </Link>
            <Link 
              href="/servicio-al-cliente/guia-tallas" 
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Guía de Tallas
            </Link>
            <span className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md">
              FAQ
            </span>
          </nav>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Encuentra respuestas rápidas a las preguntas más comunes sobre nuestros productos y servicios.
          </p>
        </div>

        {/* Buscador */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar en preguntas frecuentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <svg 
              className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navegación de Categorías */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Categorías
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                      selectedCategory === category.id
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>

              {/* Contacto de ayuda */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">¿No encuentras tu respuesta?</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Nuestro equipo está aquí para ayudarte
                </p>
                <Link 
                  href="/servicio-al-cliente/contact"
                  className="block w-full text-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Contactar Soporte
                </Link>
              </div>
            </div>
          </div>

          {/* Lista de FAQs */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              {filteredFAQs.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29.82-5.657 2.172M12 9a9 9 0 110-18 9 9 0 010 18z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron resultados
                  </h3>
                  <p className="text-gray-600">
                    Intenta con otros términos de búsqueda o selecciona una categoría diferente.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredFAQs.map((item) => (
                    <div key={item.id} className="p-6">
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="w-full text-left flex items-center justify-between hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
                      >
                        <h3 className="text-lg font-medium text-gray-900 pr-4">
                          {item.question}
                        </h3>
                        <svg 
                          className={`w-5 h-5 text-gray-500 transition-transform ${
                            expandedItems.includes(item.id) ? 'rotate-180' : ''
                          }`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {expandedItems.includes(item.id) && (
                        <div className="mt-4 text-gray-600 leading-relaxed">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sección de contacto adicional */}
            <div className="mt-8 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6 border border-red-100">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    ¿Aún necesitas ayuda?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Si no encontraste la respuesta que buscabas, nuestro equipo de servicio al cliente está disponible para ayudarte de forma personalizada.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link 
                      href="/servicio-al-cliente/contact"
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-center"
                    >
                      Enviar Mensaje
                    </Link>
                    <a 
                      href="tel:+5255123456778"
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-center"
                    >
                      Llamar Ahora
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
