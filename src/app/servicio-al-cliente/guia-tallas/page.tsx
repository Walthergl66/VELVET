'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Interfaces para TypeScript
interface SizeGuide {
  category: string;
  sizes: {
    size: string;
    bust?: string;
    waist?: string;
    hips?: string;
    chest?: string;
    neck?: string;
    inseam?: string;
  }[];
}

export default function GuiaTallasPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('mujer');

  const sizeGuides: SizeGuide[] = [
    {
      category: 'mujer',
      sizes: [
        { size: 'XS', bust: '81-84', waist: '61-64', hips: '86-89' },
        { size: 'S', bust: '86-89', waist: '66-69', hips: '91-94' },
        { size: 'M', bust: '91-94', waist: '71-74', hips: '96-99' },
        { size: 'L', bust: '96-99', waist: '76-79', hips: '101-104' },
        { size: 'XL', bust: '101-104', waist: '81-84', hips: '106-109' },
        { size: 'XXL', bust: '106-109', waist: '86-89', hips: '111-114' },
      ]
    },
    {
      category: 'hombre',
      sizes: [
        { size: 'XS', chest: '86-89', waist: '71-74', neck: '35-36' },
        { size: 'S', chest: '91-94', waist: '76-79', neck: '37-38' },
        { size: 'M', chest: '96-99', waist: '81-84', neck: '39-40' },
        { size: 'L', chest: '101-106', waist: '86-91', neck: '41-42' },
        { size: 'XL', chest: '111-116', waist: '96-101', neck: '43-44' },
        { size: 'XXL', chest: '121-126', waist: '106-111', neck: '45-46' },
      ]
    },
    {
      category: 'pantalones',
      sizes: [
        { size: '26', waist: '66', hips: '91', inseam: '76' },
        { size: '28', waist: '71', hips: '96', inseam: '76' },
        { size: '30', waist: '76', hips: '101', inseam: '81' },
        { size: '32', waist: '81', hips: '106', inseam: '81' },
        { size: '34', waist: '86', hips: '111', inseam: '86' },
        { size: '36', waist: '91', hips: '116', inseam: '86' },
      ]
    }
  ];

  const getCurrentGuide = () => {
    return sizeGuides.find(guide => guide.category === selectedCategory) || sizeGuides[0];
  };

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
            <span className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md">
              Guía de Tallas
            </span>
            <Link 
              href="/servicio-al-cliente/faq" 
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              FAQ
            </Link>
          </nav>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Guía de Tallas
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Encuentra la talla perfecta para ti con nuestras tablas de medidas detalladas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navegación de Categorías */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Categorías
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('mujer')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedCategory === 'mujer'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  👗 Ropa Mujer
                </button>
                <button
                  onClick={() => setSelectedCategory('hombre')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedCategory === 'hombre'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  👔 Ropa Hombre
                </button>
                <button
                  onClick={() => setSelectedCategory('pantalones')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedCategory === 'pantalones'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  👖 Pantalones
                </button>
              </div>

              {/* Consejos de Medición */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Consejos</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Mide sobre ropa interior</li>
                  <li>• Usa una cinta métrica flexible</li>
                  <li>• No aprietes demasiado</li>
                  <li>• Mide en centímetros</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tabla de Tallas */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {selectedCategory === 'mujer' && 'Tallas para Mujer'}
                {selectedCategory === 'hombre' && 'Tallas para Hombre'}
                {selectedCategory === 'pantalones' && 'Tallas de Pantalones'}
              </h2>

              {/* Tabla de tallas */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-4 border-b border-gray-200 font-medium text-gray-900">
                        Talla
                      </th>
                      {selectedCategory === 'mujer' && (
                        <>
                          <th className="text-left p-4 border-b border-gray-200 font-medium text-gray-900">
                            Busto (cm)
                          </th>
                          <th className="text-left p-4 border-b border-gray-200 font-medium text-gray-900">
                            Cintura (cm)
                          </th>
                          <th className="text-left p-4 border-b border-gray-200 font-medium text-gray-900">
                            Cadera (cm)
                          </th>
                        </>
                      )}
                      {selectedCategory === 'hombre' && (
                        <>
                          <th className="text-left p-4 border-b border-gray-200 font-medium text-gray-900">
                            Pecho (cm)
                          </th>
                          <th className="text-left p-4 border-b border-gray-200 font-medium text-gray-900">
                            Cintura (cm)
                          </th>
                          <th className="text-left p-4 border-b border-gray-200 font-medium text-gray-900">
                            Cuello (cm)
                          </th>
                        </>
                      )}
                      {selectedCategory === 'pantalones' && (
                        <>
                          <th className="text-left p-4 border-b border-gray-200 font-medium text-gray-900">
                            Cintura (cm)
                          </th>
                          <th className="text-left p-4 border-b border-gray-200 font-medium text-gray-900">
                            Cadera (cm)
                          </th>
                          <th className="text-left p-4 border-b border-gray-200 font-medium text-gray-900">
                            Largo (cm)
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {getCurrentGuide().sizes.map((size, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-4 border-b border-gray-100 font-medium text-gray-900">
                          {size.size}
                        </td>
                        {selectedCategory === 'mujer' && (
                          <>
                            <td className="p-4 border-b border-gray-100 text-gray-600">
                              {size.bust}
                            </td>
                            <td className="p-4 border-b border-gray-100 text-gray-600">
                              {size.waist}
                            </td>
                            <td className="p-4 border-b border-gray-100 text-gray-600">
                              {size.hips}
                            </td>
                          </>
                        )}
                        {selectedCategory === 'hombre' && (
                          <>
                            <td className="p-4 border-b border-gray-100 text-gray-600">
                              {size.chest}
                            </td>
                            <td className="p-4 border-b border-gray-100 text-gray-600">
                              {size.waist}
                            </td>
                            <td className="p-4 border-b border-gray-100 text-gray-600">
                              {size.neck}
                            </td>
                          </>
                        )}
                        {selectedCategory === 'pantalones' && (
                          <>
                            <td className="p-4 border-b border-gray-100 text-gray-600">
                              {size.waist}
                            </td>
                            <td className="p-4 border-b border-gray-100 text-gray-600">
                              {size.hips}
                            </td>
                            <td className="p-4 border-b border-gray-100 text-gray-600">
                              {size.inseam}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Instrucciones de medición */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    📏 Cómo Medir
                  </h3>
                  {selectedCategory === 'mujer' && (
                    <div className="space-y-3 text-sm text-gray-600">
                      <div>
                        <strong className="text-gray-900">Busto:</strong> Mide alrededor de la parte más completa del busto
                      </div>
                      <div>
                        <strong className="text-gray-900">Cintura:</strong> Mide la parte más estrecha del torso
                      </div>
                      <div>
                        <strong className="text-gray-900">Cadera:</strong> Mide alrededor de la parte más completa de las caderas
                      </div>
                    </div>
                  )}
                  {selectedCategory === 'hombre' && (
                    <div className="space-y-3 text-sm text-gray-600">
                      <div>
                        <strong className="text-gray-900">Pecho:</strong> Mide alrededor de la parte más ancha del pecho
                      </div>
                      <div>
                        <strong className="text-gray-900">Cintura:</strong> Mide alrededor de la cintura natural
                      </div>
                      <div>
                        <strong className="text-gray-900">Cuello:</strong> Mide alrededor de la base del cuello
                      </div>
                    </div>
                  )}
                  {selectedCategory === 'pantalones' && (
                    <div className="space-y-3 text-sm text-gray-600">
                      <div>
                        <strong className="text-gray-900">Cintura:</strong> Mide donde normalmente usas los pantalones
                      </div>
                      <div>
                        <strong className="text-gray-900">Cadera:</strong> Mide la parte más ancha de las caderas
                      </div>
                      <div>
                        <strong className="text-gray-900">Largo:</strong> Mide desde la entrepierna hasta el tobillo
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-yellow-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    ⚠️ Importante
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div>
                      Las medidas pueden variar ligeramente entre diferentes estilos y marcas
                    </div>
                    <div>
                      Si estás entre dos tallas, te recomendamos elegir la talla más grande
                    </div>
                    <div>
                      Para dudas específicas, contacta a nuestro servicio al cliente
                    </div>
                  </div>
                </div>
              </div>

              {/* Contacto para ayuda */}
              <div className="mt-8 p-6 bg-red-50 rounded-lg border border-red-200">
                <h3 className="text-lg font-bold text-red-900 mb-2">
                  ¿Necesitas ayuda con tu talla?
                </h3>
                <p className="text-red-800 mb-4">
                  Nuestro equipo de servicio al cliente puede ayudarte a encontrar la talla perfecta
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link 
                    href="/servicio-al-cliente/contact"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-center"
                  >
                    Contactar Soporte
                  </Link>
                  <a 
                    href="mailto:tallas@velvet.com"
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-center"
                  >
                    tallas@velvet.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
