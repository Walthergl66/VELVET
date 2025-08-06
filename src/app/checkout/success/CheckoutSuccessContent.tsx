'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';

const CheckoutSuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transactionId, setTransactionId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    try {
      // Obtener todos los parámetros de la URL para debugging
      const allParams: { [key: string]: string } = {};
      searchParams.forEach((value, key) => {
        allParams[key] = value;
      });
      setDebugInfo(allParams);

      console.log('🔍 TODOS los parámetros de URL:', allParams);
      console.log('🔍 URL completa:', typeof window !== 'undefined' ? window.location.href : 'Server side');

      // Obtener parámetros
      const paymentIntent = searchParams.get('payment_intent');
      const paypalOrderId = searchParams.get('paypal_order_id');
      const paypalTransactionId = searchParams.get('paypal_transaction_id');
      const orderIdParam = searchParams.get('order_id');
      
      // Parámetros adicionales de PayPal
      const paypalPaymentId = searchParams.get('paymentId');
      const paypalToken = searchParams.get('token');
      const paypalPayerId = searchParams.get('PayerID');
      
      // Más variaciones comunes de PayPal
      const paypalOrderIdAlt = searchParams.get('paypalOrderId');
      const paypalTransactionIdAlt = searchParams.get('paypalTransactionId');

      // Establecer el ID de la orden
      if (orderIdParam) {
        setOrderId(orderIdParam);
        console.log('✅ Order ID encontrado:', orderIdParam);
      } else {
        console.log('❌ No se encontró order_id en la URL');
      }

      // Detectar método de pago con más casos
      let detectedPaymentMethod = '';
      let detectedTransactionId = '';

      if (paymentIntent) {
        detectedPaymentMethod = 'Stripe';
        detectedTransactionId = paymentIntent;
        console.log('✅ Pago Stripe detectado:', paymentIntent);
      } 
      // Verificar múltiples variaciones de PayPal
      else if (paypalOrderId || paypalOrderIdAlt) {
        detectedPaymentMethod = 'PayPal';
        detectedTransactionId = paypalOrderId || paypalOrderIdAlt || '';
        console.log('✅ Pago PayPal detectado (order_id):', detectedTransactionId);
      } 
      else if (paypalTransactionId || paypalTransactionIdAlt) {
        detectedPaymentMethod = 'PayPal';
        detectedTransactionId = paypalTransactionId || paypalTransactionIdAlt || '';
        console.log('✅ Pago PayPal detectado (transaction_id):', detectedTransactionId);
      } 
      else if (paypalPaymentId) {
        detectedPaymentMethod = 'PayPal';
        detectedTransactionId = paypalPaymentId;
        console.log('✅ Pago PayPal detectado (paymentId):', paypalPaymentId);
      } 
      else if (paypalToken) {
        detectedPaymentMethod = 'PayPal';
        detectedTransactionId = paypalToken;
        console.log('✅ Pago PayPal detectado (token):', paypalToken);
      }
      // Si no hay parámetros específicos pero hay order_id, asumir que es exitoso
      else if (orderIdParam) {
        detectedPaymentMethod = 'Procesado';
        detectedTransactionId = 'N/A';
        console.log('✅ Pago detectado por order_id (método no especificado)');
      }
      // Última verificación: si estamos en la página de éxito, algo fue exitoso
      else if (typeof window !== 'undefined' && window.location.pathname.includes('/success')) {
        detectedPaymentMethod = 'Exitoso';
        detectedTransactionId = 'Sin ID específico';
        console.log('✅ En página de éxito - asumiendo pago exitoso');
      }
      else {
        console.log('❌ No se detectó ningún método de pago en la URL');
      }

      setPaymentMethod(detectedPaymentMethod);
      setTransactionId(detectedTransactionId);

      // Log completo para debugging
      console.log('✅ Estado final del pago:', {
        paymentMethod: detectedPaymentMethod || 'No detectado',
        transactionId: detectedTransactionId || 'No encontrado',
        orderId: orderIdParam || 'No encontrado',
        allUrlParams: allParams
      });

    } catch (error) {
      console.error('❌ Error en CheckoutSuccessContent:', error);
    }
  }, [searchParams]);

  // Mostrar información de debug en desarrollo
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Si no hay ningún indicador de éxito, mostrar mensaje genérico
  const showSuccess = paymentMethod || orderId || (typeof window !== 'undefined' && window.location.pathname.includes('/success'));

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        {/* Icono de éxito animado */}
        <div className="text-6xl mb-6 animate-bounce">✅</div>
        
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          {showSuccess ? '¡Pago Exitoso!' : '¡Gracias por tu compra!'}
        </h1>
        
        <p className="text-lg text-gray-700 mb-6">
          Tu pedido ha sido procesado correctamente y recibirás un email de confirmación pronto.
        </p>

        {/* Información de debug (solo en desarrollo) */}
        {isDevelopment && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-semibold text-yellow-800 mb-2">🐛 Información de Debug:</h4>
            <div className="space-y-2">
              <p className="text-xs">
                <strong>URL actual:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}
              </p>
              <p className="text-xs">
                <strong>Método detectado:</strong> {paymentMethod || 'Ninguno'}
              </p>
              <p className="text-xs">
                <strong>Transaction ID:</strong> {transactionId || 'Ninguno'}
              </p>
              <p className="text-xs">
                <strong>Order ID:</strong> {orderId || 'Ninguno'}
              </p>
              <details className="mt-2">
                <summary className="text-xs font-semibold cursor-pointer">Ver todos los parámetros</summary>
                <pre className="text-xs text-yellow-700 overflow-auto mt-2 p-2 bg-yellow-100 rounded max-h-32">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}

        {/* Información de la transacción */}
        <div className="space-y-4 mb-6">
          {orderId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600 font-semibold">Número de Pedido:</p>
              <p className="font-mono text-lg text-green-800">#{orderId}</p>
            </div>
          )}

          {transactionId && transactionId !== 'N/A' && transactionId !== 'Sin ID específico' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">ID de transacción ({paymentMethod}):</p>
              <p className="font-mono text-sm break-all text-gray-800">{transactionId}</p>
            </div>
          )}

          {/* Mostrar método de pago con icono */}
          {paymentMethod && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600 flex items-center justify-center gap-2">
                {paymentMethod === 'Stripe' ? '💳' : 
                 paymentMethod === 'PayPal' ? '🔵' : 
                 '✅'} 
                Pagado con {paymentMethod}
              </p>
            </div>
          )}

          {/* Mensaje si estamos en success pero sin información específica */}
          {showSuccess && !paymentMethod && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600">
                ✅ Pago procesado exitosamente
              </p>
            </div>
          )}
        </div>

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
