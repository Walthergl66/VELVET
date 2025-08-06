'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';

const CheckoutSuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transactionId, setTransactionId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');
    const paypalOrderId = searchParams.get('paypal_order_id');
    const paypalTransactionId = searchParams.get('paypal_transaction_id');

    if (paymentIntent) {
      setTransactionId(paymentIntent);
      setPaymentMethod('Stripe');
    } else if (paypalOrderId) {
      setTransactionId(paypalOrderId);
      setPaymentMethod('PayPal');
    } else if (paypalTransactionId) {
      setTransactionId(paypalTransactionId);
      setPaymentMethod('PayPal');
    }

    // Disparar evento personalizado para notificar que las estadísticas del usuario deben actualizarse
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('userStatsUpdate'));
      }, 1000); // Dar tiempo para que la orden se procese completamente
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-bold text-green-600 mb-4">¡Pago Exitoso!</h1>
        <p className="text-lg text-gray-700 mb-6">
          Tu pedido ha sido procesado correctamente y recibirás un email de confirmación pronto.
        </p>
        {transactionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">ID de transacción ({paymentMethod}):</p>
            <p className="font-mono text-sm break-all">{transactionId}</p>
          </div>
        )}
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">¿Qué sigue?</h3>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>• Recibirás un email de confirmación</li>
              <li>• Tu pedido será procesado en 1-2 días hábiles</li>
              <li>• Te enviaremos un número de seguimiento cuando se envíe</li>
              <li>• Puedes revisar el estado de tu pedido en tu perfil</li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button onClick={() => router.push('/shop')} variant="outline">
              Seguir Comprando
            </Button>
            <Button onClick={() => router.push('/user/dashboard')}>
              Ver Mis Pedidos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessContent;
