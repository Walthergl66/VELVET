'use client';

import React, { useState } from 'react';
import { usePaymentMethods, PaymentMethod } from '@/hooks/usePaymentMethods';
import Link from 'next/link';

interface SavedPaymentMethodsProps {
  onSelectMethod: (method: PaymentMethod) => void;
  selectedMethodId?: string;
  onUseNewCard: () => void;
}

const SavedPaymentMethods: React.FC<SavedPaymentMethodsProps> = ({
  onSelectMethod,
  selectedMethodId,
  onUseNewCard
}) => {
  const { paymentMethods, loading } = usePaymentMethods();
  const [selectedMethod, setSelectedMethod] = useState<string>(selectedMethodId || '');

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

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method.id);
    onSelectMethod(method);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">Métodos de pago guardados</h4>
        <Link
          href="/user/payment-methods"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Administrar tarjetas
        </Link>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <svg className="h-8 w-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-gray-500 text-sm">No tienes métodos de pago guardados</p>
          <button
            onClick={onUseNewCard}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Agregar nueva tarjeta
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              className={`w-full text-left border-2 rounded-lg p-4 transition-all ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleMethodSelect(method)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === method.id 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedMethod === method.id && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  
                  {getBrandIcon(method.brand)}
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        •••• •••• •••• {method.lastFour}
                      </span>
                      {method.isDefault && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Predeterminada
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {method.holderName} • Vence {formatExpiryDate(method.expiryMonth, method.expiryYear)}
                    </div>
                    <div className="text-xs text-gray-400 capitalize">
                      Tarjeta de {method.type === 'credit' ? 'crédito' : 'débito'}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xs text-gray-400">
                    Segura
                  </div>
                </div>
              </div>
            </button>
          ))}
          
          {/* Opción para usar nueva tarjeta */}
          <button
            type="button"
            className={`w-full text-left border-2 border-dashed rounded-lg p-4 transition-all ${
              selectedMethod === 'new'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => {
              setSelectedMethod('new');
              onUseNewCard();
            }}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                selectedMethod === 'new' 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300'
              }`}>
                {selectedMethod === 'new' && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              
              <div className="w-8 h-5 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Usar nueva tarjeta
                </span>
                <div className="text-xs text-gray-500">
                  Ingresa una nueva tarjeta de crédito o débito
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Información de seguridad */}
      <div className="bg-gray-50 rounded-lg p-3 mt-4">
        <div className="flex items-start space-x-2">
          <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <p className="text-xs text-gray-600">
              <span className="font-medium">Tus datos están seguros.</span> Utilizamos encriptación SSL y no almacenamos información sensible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedPaymentMethods;
