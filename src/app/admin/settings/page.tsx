'use client';

import React, { useState, useEffect } from 'react';
import { useRole } from '@/hooks/useRole';
import { useSystemSettings, SystemSettings } from '@/hooks/useSystemSettings';
import Button from '@/components/ui/Button';

/**
 * Página de configuración del sistema para administradores
 * Permite gestionar configuraciones globales del e-commerce
 */

export default function AdminSettingsPage() {
  const { role, isLoading } = useRole();
  const { 
    settings, 
    loading, 
    error: hookError, 
    updateSettings
  } = useSystemSettings();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'business' | 'shipping' | 'features' | 'notifications'>('general');

  // Estado local para edición
  const [editedSettings, setEditedSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    if (settings && !editedSettings) {
      setEditedSettings(settings);
    }
  }, [settings, editedSettings]);

  useEffect(() => {
    if (hookError) {
      setError(hookError);
    }
  }, [hookError]);

  const saveSettings = async () => {
    if (!editedSettings) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await updateSettings(editedSettings);

      setSuccess('Configuración guardada exitosamente');
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SystemSettings, value: any) => {
    if (!editedSettings) return;
    
    setEditedSettings(prev => prev ? ({
      ...prev,
      [field]: value
    }) : null);
  };

  const handleNestedInputChange = (parent: keyof SystemSettings, field: string, value: any) => {
    if (!editedSettings) return;

    setEditedSettings(prev => prev ? ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }) : null);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'business', name: 'Negocio', icon: '🏢' },
    { id: 'shipping', name: 'Envíos', icon: '🚚' },
    { id: 'features', name: 'Funciones', icon: '🎛️' },
    { id: 'notifications', name: 'Notificaciones', icon: '📧' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-gray-600">Gestiona las configuraciones globales de tu tienda</p>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={saveSettings}
            disabled={saving}
          >
            {saving ? 'Guardando...' : '💾 Guardar Cambios'}
          </Button>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: General */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Información General</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-bold mb-2 text-gray-900">Nombre del Sitio *</label>
                  <input
                    type="text"
                    value={editedSettings?.siteName || ''}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                    className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                    placeholder="Nombre de tu tienda"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold mb-2 text-gray-900">Email de Contacto *</label>
                  <input
                    type="email"
                    value={editedSettings?.contactEmail || ''}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                    placeholder="contacto@tutienda.com"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold mb-2 text-gray-900">Teléfono de Soporte</label>
                  <input
                    type="tel"
                    value={editedSettings?.supportPhone || ''}
                    onChange={(e) => handleInputChange('supportPhone', e.target.value)}
                    className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                    placeholder="+593 99 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold mb-2 text-gray-900">Moneda</label>
                  <select
                    value={editedSettings?.currency || 'USD'}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USD">USD - Dólar Americano</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="COP">COP - Peso Colombiano</option>
                    <option value="PEN">PEN - Sol Peruano</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-base font-bold mb-2 text-gray-900">Descripción del Sitio</label>
                <textarea
                  value={editedSettings?.siteDescription || ''}
                  onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                  rows={3}
                  className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                  placeholder="Descripción de tu tienda..."
                />
              </div>

              <div>
                <label className="block text-base font-bold mb-2 text-gray-900">Dirección Física</label>
                <textarea
                  value={editedSettings?.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={2}
                  className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                  placeholder="Dirección completa de tu negocio..."
                />
              </div>
            </div>
          )}

          {/* Tab: Business */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configuración del Negocio</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-bold mb-2 text-gray-900">Tasa de Impuesto (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={editedSettings?.taxRate || 0}
                    onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                    placeholder="12"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold mb-2 text-gray-900">Productos por Página</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={editedSettings?.productsPerPage || 12}
                    onChange={(e) => handleInputChange('productsPerPage', parseInt(e.target.value) || 12)}
                    className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                    placeholder="12"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold mb-2 text-gray-900">Límite Productos Destacados</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={editedSettings?.featuredProductsLimit || 8}
                    onChange={(e) => handleInputChange('featuredProductsLimit', parseInt(e.target.value) || 8)}
                    className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                    placeholder="8"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-bold mb-2 text-gray-900">Horario de Atención</label>
                <input
                  type="text"
                  value={editedSettings?.businessHours || ''}
                  onChange={(e) => handleInputChange('businessHours', e.target.value)}
                  className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                  placeholder="Lunes a Viernes: 9:00 AM - 6:00 PM"
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-base font-semibold text-gray-900">Redes Sociales</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-bold mb-2 text-gray-900">Facebook</label>
                    <input
                      type="url"
                      value={editedSettings?.socialMedia?.facebook || ''}
                      onChange={(e) => handleNestedInputChange('socialMedia', 'facebook', e.target.value)}
                      className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                      placeholder="https://facebook.com/tutienda"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-bold mb-2 text-gray-900">Instagram</label>
                    <input
                      type="url"
                      value={editedSettings?.socialMedia?.instagram || ''}
                      onChange={(e) => handleNestedInputChange('socialMedia', 'instagram', e.target.value)}
                      className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                      placeholder="https://instagram.com/tutienda"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-bold mb-2 text-gray-900">Twitter</label>
                    <input
                      type="url"
                      value={editedSettings?.socialMedia?.twitter || ''}
                      onChange={(e) => handleNestedInputChange('socialMedia', 'twitter', e.target.value)}
                      className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                      placeholder="https://twitter.com/tutienda"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-bold mb-2 text-gray-900">WhatsApp</label>
                    <input
                      type="tel"
                      value={editedSettings?.socialMedia?.whatsapp || ''}
                      onChange={(e) => handleNestedInputChange('socialMedia', 'whatsapp', e.target.value)}
                      className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                      placeholder="+593991234567"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Shipping */}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configuración de Envíos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-bold mb-2 text-gray-900">Costo de Envío Estándar ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editedSettings?.defaultShippingCost || 0}
                    onChange={(e) => handleInputChange('defaultShippingCost', parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                    placeholder="15.00"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold mb-2 text-gray-900">Umbral Envío Gratis ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editedSettings?.freeShippingThreshold || 0}
                    onChange={(e) => handleInputChange('freeShippingThreshold', parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                    placeholder="100.00"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Información sobre Envíos</h4>
                <p className="text-sm text-blue-700">
                  Los pedidos que superen $<span className="font-semibold">{editedSettings?.freeShippingThreshold || 0}</span> tendrán envío gratuito.
                  Los demás pedidos tendrán un costo de envío de $<span className="font-semibold">{editedSettings?.defaultShippingCost || 0}</span>.
                </p>
              </div>
            </div>
          )}

          {/* Tab: Features */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Funciones del Sistema</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Permitir Checkout sin Registro</h4>
                    <p className="text-sm text-gray-500">Los usuarios pueden comprar sin crear una cuenta</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedSettings?.allowGuestCheckout || false}
                      onChange={(e) => handleInputChange('allowGuestCheckout', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Verificación de Email Requerida</h4>
                    <p className="text-sm text-gray-500">Los usuarios deben verificar su email al registrarse</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedSettings?.requireEmailVerification || false}
                      onChange={(e) => handleInputChange('requireEmailVerification', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Auto-aprobar Productos</h4>
                    <p className="text-sm text-gray-500">Los productos nuevos se aprueban automáticamente</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedSettings?.autoApproveProducts || false}
                      onChange={(e) => handleInputChange('autoApproveProducts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Habilitar Reseñas</h4>
                    <p className="text-sm text-gray-500">Los usuarios pueden dejar reseñas en productos</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedSettings?.enableReviews || false}
                      onChange={(e) => handleInputChange('enableReviews', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Habilitar Lista de Deseos</h4>
                    <p className="text-sm text-gray-500">Los usuarios pueden guardar productos favoritos</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedSettings?.enableWishlist || false}
                      onChange={(e) => handleInputChange('enableWishlist', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Habilitar Cupones</h4>
                    <p className="text-sm text-gray-500">Permitir códigos de descuento en el checkout</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedSettings?.enableCoupons || false}
                      onChange={(e) => handleInputChange('enableCoupons', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between p-4 border-2 border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h4 className="font-medium text-red-900">🚧 Modo Mantenimiento</h4>
                    <p className="text-sm text-red-700">Activar para realizar mantenimiento del sitio</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedSettings?.maintenanceMode || false}
                      onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                {editedSettings?.maintenanceMode && (
                  <div className="mt-4">
                    <label className="block text-base font-bold mb-2 text-gray-900">Mensaje de Mantenimiento</label>
                    <textarea
                      value={editedSettings?.maintenanceMessage || ''}
                      onChange={(e) => handleInputChange('maintenanceMessage', e.target.value)}
                      rows={3}
                      className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                      placeholder="Mensaje que verán los usuarios durante el mantenimiento..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configuración de Notificaciones</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">📧 Confirmación de Pedido</h4>
                    <p className="text-sm text-gray-500">Enviar email al cliente cuando realice un pedido</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedSettings?.emailNotifications?.orderConfirmation || false}
                      onChange={(e) => handleNestedInputChange('emailNotifications', 'orderConfirmation', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">📦 Nuevos Pedidos (Admin)</h4>
                    <p className="text-sm text-gray-500">Notificar al admin cuando hay nuevos pedidos</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedSettings?.emailNotifications?.newOrders || false}
                      onChange={(e) => handleNestedInputChange('emailNotifications', 'newOrders', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">⚠️ Stock Bajo</h4>
                    <p className="text-sm text-gray-500">Alertar cuando productos tengan poco stock</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedSettings?.emailNotifications?.lowStock || false}
                      onChange={(e) => handleNestedInputChange('emailNotifications', 'lowStock', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">👤 Nuevos Usuarios</h4>
                    <p className="text-sm text-gray-500">Notificar cuando se registren nuevos usuarios</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedSettings?.emailNotifications?.userRegistration || false}
                      onChange={(e) => handleNestedInputChange('emailNotifications', 'userRegistration', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">⚡ Nota sobre Notificaciones</h4>
                <p className="text-sm text-yellow-700">
                  Las notificaciones por email requieren configurar un servicio SMTP.
                  Consulta la documentación para más detalles sobre la configuración.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
