'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import Link from 'next/link';
import { redirect } from 'next/navigation';

/**
 * Página para gestionar métodos de pago del usuario
 * Permite agregar, editar y eliminar tarjetas de crédito/débito
 */

interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit';
  brand: 'visa' | 'mastercard' | 'amex' | 'other';
  lastFour: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  isDefault: boolean;
  createdAt: string;
}

export default function PaymentMethodsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { 
    paymentMethods, 
    addPaymentMethod, 
    removePaymentMethod, 
    setDefaultPaymentMethod 
  } = usePaymentMethods();
  const [showAddForm, setShowAddForm] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect('/auth/login');
  }

  const getBrandIcon = (brand: string) => {
    switch (brand) {
      case 'visa':
        return (
          <div className="w-8 h-5 bg-blue-600 text-white text-xs font-bold flex items-center justify-center rounded">
            VISA
          </div>
        );
      case 'mastercard':
        return (
          <div className="w-8 h-5 bg-red-600 text-white text-xs font-bold flex items-center justify-center rounded">
            MC
          </div>
        );
      case 'amex':
        return (
          <div className="w-8 h-5 bg-green-600 text-white text-xs font-bold flex items-center justify-center rounded">
            AMEX
          </div>
        );
      default:
        return (
          <div className="w-8 h-5 bg-gray-400 text-white text-xs font-bold flex items-center justify-center rounded">
            CARD
          </div>
        );
    }
  };

  const formatExpiryDate = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultPaymentMethod(id);
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este método de pago?')) {
      try {
        await removePaymentMethod(id);
      } catch (error) {
        console.error('Error deleting payment method:', error);
      }
    }
  };

  const handleAddPaymentMethod = async (formData: any) => {
    try {
      await addPaymentMethod({
        type: formData.type,
        brand: 'visa', // Se detectaría automáticamente
        lastFour: formData.cardNumber.slice(-4),
        expiryMonth: parseInt(formData.expiryMonth),
        expiryYear: parseInt(formData.expiryYear),
        holderName: formData.holderName,
        isDefault: paymentMethods.length === 0
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding payment method:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Métodos de Pago</h1>
              <p className="mt-2 text-gray-600">
                Administra tus tarjetas y métodos de pago
              </p>
            </div>
            <Link
              href="/user/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Volver al Dashboard
            </Link>
          </div>
        </div>

        {/* Add Payment Method Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar Método de Pago
          </button>
        </div>

        {/* Payment Methods List */}
        <div className="space-y-4">
          {paymentMethods.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes métodos de pago registrados
              </h3>
              <p className="text-gray-500">
                Agrega una tarjeta para facilitar tus compras
              </p>
            </div>
          ) : (
            paymentMethods.map((method) => (
              <div key={method.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getBrandIcon(method.brand)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          •••• •••• •••• {method.lastFour}
                        </h3>
                        {method.isDefault && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Por defecto
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {method.holderName} • Vence {formatExpiryDate(method.expiryMonth, method.expiryYear)}
                      </div>
                      <div className="text-xs text-gray-400 capitalize">
                        Tarjeta de {method.type === 'credit' ? 'crédito' : 'débito'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Hacer predeterminada
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(method.id)}
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

        {/* Add Payment Method Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Agregar Método de Pago
                  </h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleAddPaymentMethod({
                    type: formData.get('type'),
                    cardNumber: formData.get('cardNumber'),
                    expiryMonth: formData.get('expiryMonth'),
                    expiryYear: formData.get('expiryYear'),
                    cvv: formData.get('cvv'),
                    holderName: formData.get('holderName')
                  });
                }}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cardType" className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de tarjeta
                      </label>
                      <select
                        id="cardType"
                        name="type"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="credit">Crédito</option>
                        <option value="debit">Débito</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Número de tarjeta
                      </label>
                      <input
                        id="cardNumber"
                        type="text"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        onChange={(e) => {
                          let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                          value = value.replace(/(.{4})/g, '$1 ').trim();
                          e.target.value = value;
                        }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 mb-1">
                          Mes
                        </label>
                        <select
                          id="expiryMonth"
                          name="expiryMonth"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <option key={month} value={month}>
                              {month.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 mb-1">
                          Año
                        </label>
                        <select
                          id="expiryYear"
                          name="expiryYear"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        >
                          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                          CVV
                        </label>
                        <input
                          id="cvv"
                          type="text"
                          name="cvv"
                          placeholder="123"
                          maxLength={4}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          onChange={(e) => {
                            e.target.value = e.target.value.replace(/\D/g, '');
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="holderName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del titular
                      </label>
                      <input
                        id="holderName"
                        type="text"
                        name="holderName"
                        placeholder="Juan Pérez"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
                    >
                      Agregar Tarjeta
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-1">
                Seguridad de tus datos
              </h3>
              <p className="text-sm text-blue-700">
                Tus datos de tarjeta están protegidos con encriptación de grado bancario. 
                Nunca almacenamos tu CVV y cumplimos con los estándares PCI DSS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
