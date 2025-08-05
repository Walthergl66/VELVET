'use client';

import React, { useState } from 'react';
import Link from 'next/link';

/**
 * Página de información de envíos y seguimiento
 * Incluye calculadora de envíos, seguimiento de paquetes y políticas
 */

interface TrackingForm {
  trackingNumber: string;
  email: string;
}

interface ShippingCalculator {
  destination: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

interface TrackingResult {
  status: string;
  location: string;
  estimatedDelivery: string;
  history: TrackingHistoryItem[];
}

interface TrackingHistoryItem {
  date: string;
  status: string;
  location: string;
}

export default function EnviosPage() {
  const [trackingData, setTrackingData] = useState<TrackingForm>({
    trackingNumber: '',
    email: ''
  });
  
  const [shippingData, setShippingData] = useState<ShippingCalculator>({
    destination: '',
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 }
  });

  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleTrackingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTracking(true);
    
    try {
      // Simular consulta de seguimiento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Datos simulados de seguimiento
      setTrackingResult({
        status: 'En tránsito',
        location: 'Centro de distribución Quito',
        estimatedDelivery: '4 de agosto, 2025',
        history: [
          { date: '1 de agosto', status: 'Pedido confirmado', location: 'Almacén VELVET - Manta' },
          { date: '2 de agosto', status: 'Empaquetado', location: 'Almacén VELVET - Manta' },
          { date: '3 de agosto', status: 'En tránsito', location: 'Centro de distribución Quito' }
        ]
      });
    } catch (err) {
      console.error('Error al rastrear paquete:', err);
    } finally {
      setIsTracking(false);
    }
  };

  const handleShippingCalculation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    
    try {
      // Simular cálculo de envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Cálculo básico simulado para Ecuador
      const baseCost = 3; // Costo base en USD
      const weightCost = shippingData.weight * 1.5; // Costo por kg
      
      // Multiplicador según provincia
      let destinationMultiplier = 1.5; // Valor por defecto
      
      // Provincias principales (menor costo)
      if (['Pichincha', 'Guayas', 'Manabí'].includes(shippingData.destination)) {
        destinationMultiplier = 1;
      }
      // Provincias intermedias
      else if (['Azuay', 'Tungurahua', 'Imbabura', 'El Oro', 'Los Ríos', 'Santo Domingo de los Tsáchilas', 'Santa Elena'].includes(shippingData.destination)) {
        destinationMultiplier = 1.3;
      }
      // Provincias amazónicas y de difícil acceso
      else if (['Morona Santiago', 'Pastaza', 'Napo', 'Orellana', 'Sucumbíos', 'Zamora Chinchipe'].includes(shippingData.destination)) {
        destinationMultiplier = 2;
      }
      // Galápagos (envío especial)
      else if (shippingData.destination === 'Galápagos') {
        destinationMultiplier = 3;
      }

      setShippingCost((baseCost + weightCost) * destinationMultiplier);
    } catch (err) {
      console.error('Error al calcular envío:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Información de Envíos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Consulta el estado de tu pedido, calcula costos de envío y conoce nuestras políticas de entrega.
          </p>
        </div>

        {/* Navegación de servicio al cliente */}
        <div className="flex justify-center mb-8">
          <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            <Link 
              href="/servicio-al-cliente/contact" 
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Contacto
            </Link>
            <span className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md">
              Envíos
            </span>
            <Link 
              href="/servicio-al-cliente/devoluciones" 
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              {/* Devoluciones
            </Link>
            <Link 
              href="/servicio-al-cliente/guia-tallas" 
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            > */}
              Guía de Tallas
            </Link>
            <Link 
              href="/servicio-al-cliente/faq" 
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              FAQ
            </Link>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Seguimiento de Paquetes */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Rastrear mi Pedido
            </h2>

            <form onSubmit={handleTrackingSubmit} className="space-y-4">
              <div>
                <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Seguimiento
                </label>
                <input
                  type="text"
                  id="trackingNumber"
                  value={trackingData.trackingNumber}
                  onChange={(e) => setTrackingData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VLV123456789"
                  required
                />
              </div>

              <div>
                <label htmlFor="trackingEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email del Pedido
                </label>
                <input
                  type="email"
                  id="trackingEmail"
                  value={trackingData.email}
                  onChange={(e) => setTrackingData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isTracking}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  isTracking
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isTracking ? 'Rastreando...' : 'Rastrear Paquete'}
              </button>
            </form>

            {/* Resultado del Seguimiento */}
            {trackingResult && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-blue-900">Estado del Envío</h3>
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                    {trackingResult.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p><strong>Ubicación actual:</strong> {trackingResult.location}</p>
                  <p><strong>Entrega estimada:</strong> {trackingResult.estimatedDelivery}</p>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium text-blue-900 mb-2">Historial:</h4>
                  <div className="space-y-2">
                    {trackingResult.history.map((item: TrackingHistoryItem) => (
                      <div key={`${item.date}-${item.status}`} className="flex justify-between text-sm">
                        <span>{item.date}</span>
                        <span>{item.status}</span>
                        <span className="text-gray-600">{item.location}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Calculadora de Envíos */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calcular Costo de Envío
            </h2>

            <form onSubmit={handleShippingCalculation} className="space-y-4">
              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                  Destino
                </label>
                <select
                  id="destination"
                  value={shippingData.destination}
                  onChange={(e) => setShippingData(prev => ({ ...prev, destination: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecciona tu provincia</option>
                  <option value="Azuay">Azuay</option>
                  <option value="Bolívar">Bolívar</option>
                  <option value="Cañar">Cañar</option>
                  <option value="Carchi">Carchi</option>
                  <option value="Chimborazo">Chimborazo</option>
                  <option value="Cotopaxi">Cotopaxi</option>
                  <option value="El Oro">El Oro</option>
                  <option value="Esmeraldas">Esmeraldas</option>
                  <option value="Galápagos">Galápagos</option>
                  <option value="Guayas">Guayas</option>
                  <option value="Imbabura">Imbabura</option>
                  <option value="Loja">Loja</option>
                  <option value="Los Ríos">Los Ríos</option>
                  <option value="Manabí">Manabí</option>
                  <option value="Morona Santiago">Morona Santiago</option>
                  <option value="Napo">Napo</option>
                  <option value="Orellana">Orellana</option>
                  <option value="Pastaza">Pastaza</option>
                  <option value="Pichincha">Pichincha</option>
                  <option value="Santa Elena">Santa Elena</option>
                  <option value="Santo Domingo de los Tsáchilas">Santo Domingo de los Tsáchilas</option>
                  <option value="Sucumbíos">Sucumbíos</option>
                  <option value="Tungurahua">Tungurahua</option>
                  <option value="Zamora Chinchipe">Zamora Chinchipe</option>
                </select>
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                  Peso estimado (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  min="0.1"
                  step="0.1"
                  value={shippingData.weight}
                  onChange={(e) => setShippingData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="1.5"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isCalculating}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  isCalculating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isCalculating ? 'Calculando...' : 'Calcular Costo'}
              </button>
            </form>

            {/* Resultado del Cálculo */}
            {shippingCost !== null && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">Costo de Envío</h3>
                <div className="text-2xl font-bold text-green-600">
                  ${shippingCost.toFixed(2)} USD
                </div>
                <p className="text-sm text-green-700 mt-2">
                  Tiempo estimado de entrega: 2-5 días hábiles
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Información de Políticas de Envío */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Zonas de Envío */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
              </svg>
              Zonas de Envío
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Quito, Guayaquil, Manta</span>
                <span className="font-medium text-green-600">$3-5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Costa y Sierra</span>
                <span className="font-medium text-blue-600">$4-7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amazonía</span>
                <span className="font-medium text-orange-600">$6-10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Galápagos</span>
                <span className="font-medium text-red-600">$15-25</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>🆓 Envío gratis</strong> en compras mayores a $50 USD
              </p>
            </div>
          </div>

          {/* Tiempos de Entrega */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tiempos de Entrega
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-gray-900">Envío Estándar</div>
                <div className="text-gray-600">3-5 días hábiles</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Envío Express</div>
                <div className="text-gray-600">1-2 días hábiles</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Recolección en tienda</div>
                <div className="text-gray-600">Mismo día (sin costo)</div>
              </div>
            </div>
          </div>

          {/* Políticas Importantes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Políticas Importantes
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div>• Horario de entrega: 9:00 - 18:00 hrs</div>
              <div>• Se requiere alguien para recibir el paquete</div>
              <div>• Verificación de identidad necesaria</div>
              <div>• Empaque seguro y discreto</div>
              <div>• Seguro incluido en todos los envíos</div>
            </div>
          </div>
        </div>

        {/* Enlaces Rápidos */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/servicio-al-cliente/contact" 
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Volver a Servicio al Cliente
            </Link>
            <Link 
              href="/servicio-al-cliente/devoluciones" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Políticas de Devolución →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
