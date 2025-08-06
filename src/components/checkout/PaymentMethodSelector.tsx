'use client';

import React, { useState } from 'react';
import StripeProvider from './StripeProvider';
import StripePaymentForm from './StripePaymentForm';
import PayPalProvider from './PayPalProvider';
import PayPalPaymentForm from './PayPalPaymentForm';
import SavedPaymentMethods from './SavedPaymentMethods';
import Button from '@/components/ui/Button';
import { PaymentMethod as SavedPaymentMethod } from '@/hooks/usePaymentMethods';

interface PaymentMethodSelectorProps {
  clientSecret?: string;
  amount: number;
  shippingInfo: any;
  onSuccess: (details: any) => void;
  onError: (error: string) => void;
}

type PaymentMethod = 'saved' | 'stripe' | 'paypal';

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  clientSecret,
  amount,
  shippingInfo,
  onSuccess,
  onError,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('saved');
  const [selectedSavedCard, setSelectedSavedCard] = useState<SavedPaymentMethod | null>(null);
  const [useNewCard, setUseNewCard] = useState(false);

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedMethod(method);
    if (method !== 'saved') {
      setSelectedSavedCard(null);
      setUseNewCard(false);
    }
  };

  const handleSavedCardSelect = (method: SavedPaymentMethod) => {
    setSelectedSavedCard(method);
    setUseNewCard(false);
  };

  const handleUseNewCard = () => {
    setUseNewCard(true);
    setSelectedSavedCard(null);
  };

  const handleSavedCardPayment = async () => {
    if (!selectedSavedCard) return;
    
    try {
      // Aquí implementarías el procesamiento del pago con la tarjeta guardada
      // Por ahora, simularemos un pago exitoso
      const mockPaymentIntent = {
        id: `pi_${Date.now()}`,
        status: 'succeeded',
        payment_method: `pm_${selectedSavedCard.id}`,
        amount: amount * 100, // Stripe usa centavos
        currency: 'usd'
      };
      
      setTimeout(() => {
        onSuccess(mockPaymentIntent);
      }, 1000);
    } catch (error) {
      console.error('Payment error:', error);
      onError('Error al procesar el pago con la tarjeta guardada');
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector de tipo de método de pago */}
      <div className="space-y-3">
        <h4 className="text-lg font-medium">Elige tu método de pago</h4>
        
        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            className={`p-4 border-2 rounded-lg flex items-center space-x-3 transition-all ${
              selectedMethod === 'saved'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handlePaymentMethodChange('saved')}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              selectedMethod === 'saved' ? 'border-blue-500' : 'border-gray-300'
            }`}>
              {selectedMethod === 'saved' && (
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Usar tarjeta guardada</span>
              <div className="flex space-x-1">
                <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Rápido</div>
                <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Seguro</div>
              </div>
            </div>
          </button>

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
              <span className="font-medium">Nueva Tarjeta de Crédito/Débito</span>
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
        {selectedMethod === 'saved' && (
          <div className="space-y-4">
            <SavedPaymentMethods
              onSelectMethod={handleSavedCardSelect}
              selectedMethodId={selectedSavedCard?.id}
              onUseNewCard={handleUseNewCard}
            />
            
            {selectedSavedCard && !useNewCard && (
              <div className="pt-4">
                <Button
                  onClick={handleSavedCardPayment}
                  className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Pagar ${amount.toFixed(2)} USD con {selectedSavedCard.brand.toUpperCase()} ••••{selectedSavedCard.lastFour}
                </Button>
              </div>
            )}
            
            {useNewCard && clientSecret && (
              <div className="pt-4 border-t border-gray-200">
                <h5 className="text-sm font-medium text-gray-900 mb-4">Ingresar nueva tarjeta</h5>
                <StripeProvider>
                  <StripePaymentForm
                    clientSecret={clientSecret}
                    amount={amount}
                    shippingInfo={shippingInfo}
                    onSuccess={onSuccess}
                    onError={onError}
                  />
                </StripeProvider>
              </div>
            )}
          </div>
        )}

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
