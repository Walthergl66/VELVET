'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/lib/supabase';
import { Address } from '@/types';
import Link from 'next/link';
import { redirect } from 'next/navigation';

/**
 * Página de gestión de direcciones de envío del usuario
 * Permite agregar, editar y eliminar direcciones conectadas a Supabase
 */

// Interfaces para el formulario (simplificado para coincidir con la BD)
interface AddressForm {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function AddressesPage() {
  const { isAuthenticated, loading } = useAuth();
  
  // Estados para gestión de direcciones
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<AddressForm>({
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'México',
    is_default: false
  });

  // Cargar direcciones al montar el componente
  useEffect(() => {
    if (isAuthenticated) {
      loadAddresses();
    }
  }, [isAuthenticated]);

  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getUserAddresses();
      if (error) {
        setNotification({
          type: 'error',
          message: 'Error al cargar las direcciones: ' + error
        });
      } else {
        setAddresses(data || []);
      }
    } catch {
      setNotification({
        type: 'error',
        message: 'Error inesperado al cargar las direcciones'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verificación de autenticación
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect('/auth/login');
  }

  // Manejadores de eventos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      street: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'México',
      is_default: false
    });
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingAddress) {
        // Editar dirección existente
        const { error } = await updateAddress(editingAddress.id, {
          type: 'shipping',
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          country: formData.country,
          is_default: formData.is_default
        });

        if (error) {
          throw new Error(typeof error === 'string' ? error : error.message);
        }

        setNotification({
          type: 'success',
          message: 'Dirección actualizada correctamente'
        });
      } else {
        // Agregar nueva dirección
        const { error } = await createAddress({
          type: 'shipping',
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          country: formData.country,
          is_default: formData.is_default
        });

        if (error) {
          throw new Error(typeof error === 'string' ? error : error.message);
        }

        setNotification({
          type: 'success',
          message: 'Dirección agregada correctamente'
        });
      }

      await loadAddresses(); // Recargar las direcciones
      resetForm();
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Error al guardar la dirección'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      street: address.street,
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
      country: address.country,
      is_default: address.is_default
    });
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
      try {
        const { error } = await deleteAddress(id);
        if (error) {
          throw new Error(typeof error === 'string' ? error : error.message);
        }
        
        setNotification({
          type: 'success',
          message: 'Dirección eliminada correctamente'
        });
        
        await loadAddresses(); // Recargar las direcciones
      } catch (error) {
        setNotification({
          type: 'error',
          message: error instanceof Error ? error.message : 'Error al eliminar la dirección'
        });
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const { error } = await setDefaultAddress(id);
      if (error) {
        throw new Error(typeof error === 'string' ? error : error.message);
      }
      
      setNotification({
        type: 'success',
        message: 'Dirección predeterminada actualizada'
      });
      
      await loadAddresses(); // Recargar las direcciones
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Error al actualizar dirección predeterminada'
      });
    }
  };

  // Estados mexicanos para el dropdown
  const mexicanStates = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
    'Chiapas', 'Chihuahua', 'CDMX', 'Coahuila', 'Colima', 'Durango',
    'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco',
    'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
    'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
    'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz',
    'Yucatán', 'Zacatecas'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/user/dashboard" className="text-gray-500 hover:text-gray-700">
                  Dashboard
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 font-medium">Direcciones</li>
            </ol>
          </nav>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Direcciones</h1>
              <p className="text-gray-600 mt-1">Gestiona tus direcciones de envío</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              + Agregar Dirección
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {notification.message}
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 text-sm underline"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Formulario de dirección */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dirección (calle) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="Calle, número exterior e interior"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                {/* Ciudad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="">Selecciona un estado</option>
                    {mexicanStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* Código Postal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    pattern="[0-9]{5}"
                    maxLength={5}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                {/* País */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="México">México</option>
                  </select>
                </div>

                {/* Dirección predeterminada */}
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_default"
                      checked={formData.is_default}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Establecer como dirección predeterminada
                    </span>
                  </label>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-black hover:bg-gray-800'
                  } text-white`}
                >
                  {isSubmitting ? 'Guardando...' : (editingAddress ? 'Actualizar' : 'Guardar')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de direcciones */}
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes direcciones guardadas</h3>
              <p className="text-gray-500 mb-6">Agrega tu primera dirección para hacer compras más rápidas</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Agregar Primera Dirección
              </button>
            </div>
          ) : (
            addresses.map((address) => (
              <div key={address.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 mr-3">
                        Dirección de Envío
                      </h3>
                      {address.is_default && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          Predeterminada
                        </span>
                      )}
                    </div>
                    <div className="text-gray-600 space-y-1">
                      <p>{address.street}</p>
                      <p>{address.city}, {address.state} {address.zip_code}</p>
                      <p>{address.country}</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-6">
                    <button
                      onClick={() => handleEdit(address)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Editar
                    </button>
                    {!address.is_default && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="text-sm text-green-600 hover:text-green-800 font-medium"
                      >
                        Predeterminada
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
