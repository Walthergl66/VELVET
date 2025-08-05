'use client';

import React, { useState } from 'react';
import StripeProvider from './StripeProvider';
import StripePaymentForm from './StripePaymentForm';
import PayPalProvider from './PayPalProvider';
import PayPalPaymentForm from './PayPalPaymentForm';
import Button from '@/components/ui/Button';

interface PaymentMethodSelectorProps {
  clientSecret?: string;
  amount: number;
  shippingInfo: any;
  onSuccess: (details: any) => void;
  onError: (error: string) => void;
}

type PaymentMethod = 'stripe' | 'paypal';

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  clientSecret,
  amount,
  shippingInfo,
  onSuccess,
  onError,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('stripe');

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  return (
    <div className="space-y-6">
      {/* Selector de método de pago */}
      <div className="space-y-3">
        <h4 className="text-lg font-medium">Elige tu método de pago</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            className={`p-4 border-2 rounded-lg flex items-center space-x-3 transition-all ${
              selectedMethod === 'stripe'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handlePaymentMethodChange('stripe')}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              selectedMethod === 'stripe' ? 'border-blue-500' : 'border-gray-300'
            }`}>
              {selectedMethod === 'stripe' && (
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Tarjeta de Crédito/Débito</span>
              <div className="flex space-x-1">
                <div className="text-xs bg-gray-100 px-2 py-1 rounded">Visa</div>
                <div className="text-xs bg-gray-100 px-2 py-1 rounded">MC</div>
                <div className="text-xs bg-gray-100 px-2 py-1 rounded">Amex</div>
              </div>
            </div>
          </button>

          <button
            type="button"
            className={`p-4 border-2 rounded-lg flex items-center space-x-3 transition-all ${
              selectedMethod === 'paypal'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handlePaymentMethodChange('paypal')}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              selectedMethod === 'paypal' ? 'border-blue-500' : 'border-gray-300'
            }`}>
              {selectedMethod === 'paypal' && (
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">PayPal</span>
              <div className="text-sm text-blue-600 font-semibold">PayPal</div>
            </div>
          </button>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-gray-200"></div>

      {/* Formulario de pago según el método seleccionado */}
      <div className="min-h-[200px]">
        {selectedMethod === 'stripe' && clientSecret && (
          <StripeProvider>
            <StripePaymentForm
              clientSecret={clientSecret}
              amount={amount}
              shippingInfo={shippingInfo}
              onSuccess={onSuccess}
              onError={onError}
            />
          </StripeProvider>
        )}

        {selectedMethod === 'stripe' && !clientSecret && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Preparando pago con tarjeta...</span>
          </div>
        )}

        {selectedMethod === 'paypal' && (
          <PayPalProvider>
            <PayPalPaymentForm
              amount={amount}
              shippingInfo={shippingInfo}
              onSuccess={onSuccess}
              onError={onError}
            />
          </PayPalProvider>
        )}
      </div>

      {/* Información de seguridad */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span className="text-green-600">🔒</span>
          <span>
            Todos los pagos son procesados de forma segura. Tu información financiera está protegida.
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
