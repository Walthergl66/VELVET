'use client';

import React, { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useCart } from '@/context/CartContext';

interface PayPalPaymentFormProps {
  amount: number;
  shippingInfo: any;
  onSuccess: (details: any) => void;
  onError: (error: string) => void;
}

const PayPalPaymentForm: React.FC<PayPalPaymentFormProps> = ({
  amount,
  shippingInfo,
  onSuccess,
  onError,
}) => {
  const [{ isResolved, isPending }] = usePayPalScriptReducer();
  const [isProcessing, setIsProcessing] = useState(false);
  const { cart } = useCart();

  if (!isResolved) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando PayPal...</span>
      </div>
    );
  }

  const createOrder = async () => {
    try {
      setIsProcessing(true);

      const items = cart.items.map(item => ({
        name: item.product?.name || 'Producto',
        price: item.product?.price || 0,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      const response = await fetch('/api/pay-pal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'USD',
          items,
          shippingInfo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('PayPal API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Error al crear la orden de PayPal: ${response.status} - ${errorData}`);
      }

      const orderData = await response.json();
      return orderData.id;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      onError('Error al crear la orden de PayPal');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const onApprove = async (data: any) => {
    try {
      setIsProcessing(true);

      const response = await fetch('/api/pay-pal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderID: data.orderID,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al capturar el pago de PayPal');
      }

      const details = await response.json();
      
      console.log('🎉 PayPal payment captured successfully:', details);
      console.log('📋 PayPal capture response details:', JSON.stringify(details, null, 2));
      console.log('📦 PayPal order data:', JSON.stringify(data, null, 2));
      
      // Estructurar los datos de PayPal de manera similar a Stripe para compatibilidad
      const paymentIntent = {
        id: details.id || `paypal_${data.orderID}`,
        status: 'succeeded',
        payment_method: {
          type: 'paypal',
          paypal_email: details.payer?.email_address || 'unknown',
          paypal_order_id: data.orderID,
          paypal_transaction_id: details.id
        },
        amount: amount * 100, // Convertir a centavos para consistencia con Stripe
        currency: 'usd',
        payment_method_type: 'paypal'
      };
      
      console.log('🔄 Calling onSuccess with PayPal payment intent:', paymentIntent);
      console.log('🛒 About to trigger inventory update for PayPal payment');
      
      // Llamar a onSuccess para que se ejecute handlePaymentSuccess y se actualice el inventario
      onSuccess(paymentIntent);
    } catch (error) {
      console.error('Error capturing PayPal payment:', error);
      onError('Error al procesar el pago de PayPal');
    } finally {
      setIsProcessing(false);
    }
  };

  const onCancel = () => {
    onError('Pago cancelado por el usuario');
  };

  const onPayPalError = (err: any) => {
    console.error('PayPal error:', err);
    onError('Error en PayPal');
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-lg font-medium mb-2">Pagar con PayPal</h4>
        <p className="text-gray-600 text-sm mb-4">
          Serás redirigido a PayPal para completar tu pago de forma segura
        </p>
      </div>

      {isProcessing && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2">Procesando pago...</span>
        </div>
      )}

      <PayPalButtons
        disabled={isProcessing || isPending}
        style={{
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal',
        }}
        createOrder={createOrder}
        onApprove={onApprove}
        onCancel={onCancel}
        onError={onPayPalError}
      />

      <div className="text-xs text-gray-500 text-center mt-4">
        Al hacer clic en el botón de PayPal, aceptas ser redirigido a PayPal para completar tu pago.
        Todos los precios están en USD.
      </div>
    </div>
  );
};

export default PayPalPaymentForm;
