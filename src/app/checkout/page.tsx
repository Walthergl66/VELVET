'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Página de checkout - Proceso de finalización de compra
 * Incluye resumen del pedido, información de envío y pago
 */

interface ShippingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentForm {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);

  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'México',
  });

  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
  });

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Tu carrito está vacío
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Agrega algunos productos antes de proceder al checkout.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Ir a la Tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('review');
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para completar tu pedido');
      return;
    }

    setIsProcessing(true);
    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Limpiar carrito después del pedido exitoso
      await clearCart();
      
      // Redirigir a página de confirmación
      alert('¡Pedido realizado con éxito! Recibirás un email de confirmación.');
      window.location.href = '/user/dashboard';
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      alert('Error al procesar el pedido. Inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { id: 'shipping', name: 'Envío', completed: currentStep !== 'shipping' },
    { id: 'payment', name: 'Pago', completed: currentStep === 'review' },
    { id: 'review', name: 'Revisión', completed: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Carrito
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step.completed || currentStep === step.id
                    ? 'bg-black border-black text-white'
                    : 'bg-white border-gray-300 text-gray-300'
                }`}>
                  {step.completed ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step.completed || currentStep === step.id ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.completed ? 'bg-black' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Authentication Notice */}
            {!isAuthenticated && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <svg className="flex-shrink-0 h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Inicia sesión para una experiencia mejor
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        <Link href="/auth/login" className="font-medium underline">
                          Inicia sesión
                        </Link>{' '}
                        o{' '}
                        <Link href="/auth/register" className="font-medium underline">
                          regístrate
                        </Link>{' '}
                        para guardar tu información y hacer seguimiento a tus pedidos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Form */}
            {currentStep === 'shipping' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Información de Envío</h2>
                </div>
                <form onSubmit={handleShippingSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        required
                        value={shippingForm.firstName}
                        onChange={(e) => setShippingForm({...shippingForm, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Apellido *
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        required
                        value={shippingForm.lastName}
                        onChange={(e) => setShippingForm({...shippingForm, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={shippingForm.email}
                        onChange={(e) => setShippingForm({...shippingForm, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        value={shippingForm.phone}
                        onChange={(e) => setShippingForm({...shippingForm, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección *
                    </label>
                    <input
                      id="address"
                      type="text"
                      required
                      value={shippingForm.address}
                      onChange={(e) => setShippingForm({...shippingForm, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      placeholder="Calle, número, colonia"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad *
                      </label>
                      <input
                        id="city"
                        type="text"
                        required
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm({...shippingForm, city: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        Estado *
                      </label>
                      <input
                        id="state"
                        type="text"
                        required
                        value={shippingForm.state}
                        onChange={(e) => setShippingForm({...shippingForm, state: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      />
                    </div>
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Código Postal *
                      </label>
                      <input
                        id="zipCode"
                        type="text"
                        required
                        value={shippingForm.zipCode}
                        onChange={(e) => setShippingForm({...shippingForm, zipCode: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                      Continuar al Pago
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Payment Form */}
            {currentStep === 'payment' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Información de Pago</h2>
                </div>
                <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Tarjeta *
                    </label>
                    <input
                      id="cardNumber"
                      type="text"
                      required
                      value={paymentForm.cardNumber}
                      onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre en la Tarjeta *
                    </label>
                    <input
                      id="cardName"
                      type="text"
                      required
                      value={paymentForm.cardName}
                      onChange={(e) => setPaymentForm({...paymentForm, cardName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      placeholder="Como aparece en la tarjeta"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Vencimiento *
                      </label>
                      <input
                        id="expiryDate"
                        type="text"
                        required
                        value={paymentForm.expiryDate}
                        onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                        placeholder="MM/AA"
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                        CVV *
                      </label>
                      <input
                        id="cvv"
                        type="text"
                        required
                        value={paymentForm.cvv}
                        onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep('shipping')}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                      Revisar Pedido
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Review Order */}
            {currentStep === 'review' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Revisar Pedido</h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Shipping Info */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Información de Envío</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{shippingForm.firstName} {shippingForm.lastName}</p>
                      <p>{shippingForm.address}</p>
                      <p>{shippingForm.city}, {shippingForm.state} {shippingForm.zipCode}</p>
                      <p>{shippingForm.phone}</p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Método de Pago</h3>
                    <div className="text-sm text-gray-600">
                      <p>**** **** **** {paymentForm.cardNumber.slice(-4)}</p>
                      <p>{paymentForm.cardName}</p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setCurrentStep('payment')}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Volver
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? 'Procesando...' : 'Realizar Pedido'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm sticky top-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Resumen del Pedido</h2>
              </div>
              <div className="p-6 space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={item.product.images?.[0] || '/images/placeholder.jpg'}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.size} • {item.color} • Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice((item.product.discount_price || item.product.price) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="border-gray-200" />

                {/* Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatPrice(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío:</span>
                    <span className="font-medium">
                      {cart.shipping === 0 ? 'Gratis' : formatPrice(cart.shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IVA (16%):</span>
                    <span className="font-medium">{formatPrice(cart.tax)}</span>
                  </div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Descuento:</span>
                      <span className="font-medium text-red-600">
                        -{formatPrice(cart.discount)}
                      </span>
                    </div>
                  )}
                </div>

                <hr className="border-gray-200" />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{formatPrice(cart.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
              <span className="text-gray-900 font-medium">Procesando tu pedido...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
