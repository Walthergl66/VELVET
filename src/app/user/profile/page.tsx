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
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
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
    setNotification(null);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setIsEditing(false);
        setNotification({ type: 'success', message: 'Perfil actualizado correctamente' });
      } else {
        setNotification({ type: 'error', message: result.error || 'Error al actualizar el perfil' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({ type: 'error', message: 'Error inesperado al actualizar el perfil' });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 sm:py-12 px-2 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
          <Link
            href="/user/dashboard"
            className="text-black hover:text-[#B32134] transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black select-none">Mi Perfil</h1>
        </div>
        <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg text-center px-4">
          Gestiona tu información personal y preferencias de cuenta
        </p>

        {/* Notification */}
        {notification && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl shadow border flex items-center gap-2 animate-fade-in-fast mx-2 sm:mx-0 ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {notification.type === 'success' ? (
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-sm sm:text-base">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-current hover:opacity-70 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="space-y-6 sm:space-y-8">
          {/* Información Personal */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mx-2 sm:mx-0">
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-black">Información Personal</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 sm:px-5 py-2 bg-black text-white rounded-full font-semibold shadow hover:bg-[#B32134] hover:scale-105 transition-all duration-200 text-sm sm:text-base self-start sm:self-auto"
                >
                  Editar
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-3 sm:px-5 py-2 text-black border border-gray-300 rounded-full font-semibold hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 text-sm sm:text-base"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-3 sm:px-5 py-2 bg-black text-white rounded-full font-semibold shadow hover:bg-[#B32134] hover:scale-105 transition-all duration-200 disabled:opacity-50 text-sm sm:text-base"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-8 space-y-6">
              {/* Email (No editable) */}
              <div>
                <label htmlFor="email-field" className="block text-sm font-semibold text-gray-800 mb-3">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 font-medium text-base shadow-sm">
                    {user?.email}
                  </div>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2 font-medium">
                  ✓ El correo electrónico no se puede modificar
                </p>
              </div>

              {/* Nombre */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-semibold text-gray-800 mb-3">
                    Nombre
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black placeholder-gray-600 text-base font-medium"
                      placeholder="Tu nombre"
                    />
                  ) : (
                    <div className="relative">
                      <div className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 font-semibold text-base shadow-sm min-h-[50px] flex items-center">
                        {formData.first_name || (
                          <span className="text-orange-600 italic font-medium">No especificado</span>
                        )}
                      </div>
                      {formData.first_name && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-semibold text-gray-800 mb-3">
                    Apellido
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black placeholder-gray-600 text-base font-medium"
                      placeholder="Tu apellido"
                    />
                  ) : (
                    <div className="relative">
                      <div className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 font-semibold text-base shadow-sm min-h-[50px] flex items-center">
                        {formData.last_name || (
                          <span className="text-orange-600 italic font-medium">No especificado</span>
                        )}
                      </div>
                      {formData.last_name && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-3">
                  Teléfono
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black placeholder-gray-600 text-base font-medium"
                    placeholder="+52 (555) 123-4567"
                  />
                ) : (
                  <div className="relative">
                    <div className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 font-semibold text-base shadow-sm min-h-[50px] flex items-center">
                      {formData.phone || (
                        <span className="text-orange-600 italic font-medium">No especificado</span>
                      )}
                    </div>
                    {formData.phone && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fecha de registro */}
              <div>
                <label htmlFor="member-since" className="block text-sm font-semibold text-gray-800 mb-3">
                  Miembro desde
                </label>
                <div className="relative">
                  <div className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 font-semibold text-base shadow-sm">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-EC', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'No disponible'}
                  </div>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración de Cuenta */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mx-2 sm:mx-0">
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100">
              <h2 className="text-xl sm:text-2xl font-bold text-black">Configuración de Cuenta</h2>
            </div>
            <div className="p-4 sm:p-8 space-y-4">
              <Link
                href="/user/change-password"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-gray-400 mr-3 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v14a2 2 0 002 2h6a2 2 0 002-2v-1" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-black">Cambiar Contraseña</h3>
                    <p className="text-sm text-gray-500">Actualiza tu contraseña de acceso</p>
                  </div>
                </div>
                <svg className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <label htmlFor="email-notifications" className="relative inline-flex items-center cursor-pointer">
                  <span className="sr-only">Activar notificaciones por email</span>
                  <input id="email-notifications" type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Zona de Peligro */}
          <div className="bg-white rounded-2xl shadow-xl border border-red-200 mx-2 sm:mx-0">
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-red-200">
              <h2 className="text-xl sm:text-2xl font-bold text-red-900">Zona de Peligro</h2>
            </div>
            <div className="p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-red-900">Eliminar Cuenta</h3>
                  <p className="text-sm text-red-600">
                    Esta acción no se puede deshacer. Se eliminarán todos tus datos permanentemente.
                  </p>
                </div>
                <button className="px-4 sm:px-5 py-2 bg-gradient-to-r from-[#ff3b4a] via-[#B32134] to-[#490000] text-white rounded-full font-semibold shadow hover:scale-105 transition-all duration-200 text-sm sm:text-base self-start sm:self-auto">
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
