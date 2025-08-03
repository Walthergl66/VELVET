'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Interfaces para TypeScript
interface DevolucionForm {
  orderNumber: string;
  email: string;
  reason: string;
  productName: string;
  description: string;
  returnType: 'devolucion' | 'cambio';
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function DevolucionesPage() {
  const [formData, setFormData] = useState<DevolucionForm>({
    orderNumber: '',
    email: '',
    reason: '',
    productName: '',
    description: '',
    returnType: 'devolucion'
  });

  const [notification, setNotification] = useState<Notification | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulación de envío
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setNotification({
        type: 'success',
        message: 'Tu solicitud de devolución ha sido enviada. Te contactaremos pronto con las instrucciones.'
      });
      
      // Limpiar formulario
      setFormData({
        orderNumber: '',
        email: '',
        reason: '',
        productName: '',
        description: '',
        returnType: 'devolucion'
      });
    } catch {
      setNotification({
        type: 'error',
        message: 'Error al enviar la solicitud. Por favor intenta nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
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
              Devoluciones
            </span>
            <Link 
              href="/servicio-al-cliente/guia-tallas" 
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
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

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Devoluciones y Cambios
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Solicita la devolución o cambio de tus productos de manera fácil y rápida.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de Devolución */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Solicitar Devolución o Cambio
              </h2>

              {/* Notification */}
              {notification && (
                <div className={`mb-6 p-4 rounded-lg ${
                  notification.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {notification.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipo de Solicitud */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Solicitud *
                  </label>
                  <select
                    name="returnType"
                    value={formData.returnType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="devolucion">Devolución (Reembolso)</option>
                    <option value="cambio">Cambio por otro producto</option>
                  </select>
                </div>

                {/* Número de Pedido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Pedido *
                  </label>
                  <input
                    type="text"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: VEL-2024-001234"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de la Compra *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="tu@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                {/* Nombre del Producto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    required
                    placeholder="Nombre del producto a devolver"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                {/* Motivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo de la Devolución *
                  </label>
                  <select
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Selecciona un motivo</option>
                    <option value="defectuoso">Producto defectuoso</option>
                    <option value="talla">Talla incorrecta</option>
                    <option value="color">Color diferente al esperado</option>
                    <option value="calidad">No cumple con la calidad esperada</option>
                    <option value="descripcion">No coincide con la descripción</option>
                    <option value="dano">Llegó dañado</option>
                    <option value="otro">Otro motivo</option>
                  </select>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción Detallada
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe el problema o motivo de la devolución..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                {/* Botón Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white`}
                >
                  {isSubmitting ? 'Procesando...' : 'Enviar Solicitud'}
                </button>
              </form>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="space-y-6">
            {/* Política de Devoluciones */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Política de Devoluciones
              </h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900">Plazo</h4>
                  <p>30 días desde la fecha de compra</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Condiciones</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Producto en estado original</li>
                    <li>Etiquetas sin remover</li>
                    <li>Embalaje original</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Proceso</h4>
                  <p>Reembolso en 5-7 días hábiles</p>
                </div>
              </div>
            </div>

            {/* Contacto Directo */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                ¿Necesitas Ayuda?
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="text-red-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">devoluciones@velvet.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-red-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Teléfono</p>
                    <p className="text-gray-600">+52 55 1234 5678</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Rápido */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Preguntas Frecuentes
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900">¿Quién paga el envío de devolución?</h4>
                  <p className="text-gray-600">Si el producto tiene defecto, nosotros cubrimos el costo.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">¿Puedo cambiar por otra talla?</h4>
                  <p className="text-gray-600">Sí, sujeto a disponibilidad de inventario.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">¿Cómo rastreo mi devolución?</h4>
                  <p className="text-gray-600">Te enviaremos un número de seguimiento por email.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
