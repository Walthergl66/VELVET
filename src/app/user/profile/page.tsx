'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

/**
 * Página de perfil del usuario
 * Permite ver y editar información personal
 */

export default function UserProfile() {
  const { user, isAuthenticated, loading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  React.useEffect(() => {
    if (user?.user_metadata) {
      setFormData({
        first_name: user.user_metadata.first_name || '',
        last_name: user.user_metadata.last_name || '',
        phone: user.user_metadata.phone || '',
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect('/auth/login');
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setIsEditing(false);
        // TODO: Mostrar notificación de éxito
        alert('Perfil actualizado correctamente');
      } else {
        alert(result.error || 'Error al actualizar el perfil');
      }
    } catch (error) {
      alert('Error inesperado al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Restaurar datos originales
    if (user?.user_metadata) {
      setFormData({
        first_name: user.user_metadata.first_name || '',
        last_name: user.user_metadata.last_name || '',
        phone: user.user_metadata.phone || '',
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/user/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Gestiona tu información personal y preferencias de cuenta
          </p>
        </div>

        <div className="space-y-6">
          {/* Información Personal */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-black hover:text-gray-800 font-medium transition-colors"
                >
                  Editar
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Email (No editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                  {user?.email}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  El correo electrónico no se puede modificar
                </p>
              </div>

              {/* Nombre */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      placeholder="Tu nombre"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      {formData.first_name || 'No especificado'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      placeholder="Tu apellido"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      {formData.last_name || 'No especificado'}
                    </div>
                  )}
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    placeholder="+52 (555) 123-4567"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {formData.phone || 'No especificado'}
                  </div>
                )}
              </div>

              {/* Fecha de registro */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miembro desde
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'No disponible'}
                </div>
              </div>
            </div>
          </div>

          {/* Configuración de Cuenta */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Configuración de Cuenta</h2>
            </div>
            <div className="p-6 space-y-4">
              <Link
                href="/user/change-password"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v14a2 2 0 002 2h6a2 2 0 002-2v-1" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-gray-900">Cambiar Contraseña</h3>
                    <p className="text-sm text-gray-500">Actualiza tu contraseña de acceso</p>
                  </div>
                </div>
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-gray-900">Notificaciones por Email</h3>
                    <p className="text-sm text-gray-500">Recibe actualizaciones sobre tus pedidos</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Zona de Peligro */}
          <div className="bg-white rounded-lg shadow-sm border border-red-200">
            <div className="px-6 py-4 border-b border-red-200">
              <h2 className="text-lg font-semibold text-red-900">Zona de Peligro</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-red-900">Eliminar Cuenta</h3>
                  <p className="text-sm text-red-600">
                    Esta acción no se puede deshacer. Se eliminarán todos tus datos permanentemente.
                  </p>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Eliminar Cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
