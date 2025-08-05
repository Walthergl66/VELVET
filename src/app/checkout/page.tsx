'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import Button from '@/components/ui/Button';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  phone: string;
}

const CheckoutPage = () => {
  const router = useRouter();
  const { cart, getItemCount, clearCart } = useCart();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    address: '',
    city: '',
    zipCode: '',
    country: 'Ecuador',
    phone: ''
  });

  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);
  const shipping = subtotal > 1000 ? 0 : 100;
  const tax = subtotal * 0.16;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (getItemCount() === 0) {
      router.push('/cart');
    }
  }, [getItemCount, router]);

  useEffect(() => {
    if (getItemCount() > 0 && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [getItemCount, currentStep]);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: 'mxn',
          metadata: {
            orderId: `order_${Date.now()}`,
            userId: user?.id || 'guest',
            items: cart.items.map(item => ({
              productId: item.product_id,
              quantity: item.quantity,
              size: item.size,
              color: item.color
            }))
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear el intento de pago');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleShippingChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateShippingInfo = () => {
    const required = ['firstName', 'lastName', 'email', 'address', 'city', 'zipCode', 'phone'];
    return required.every(field => shippingInfo[field as keyof ShippingInfo].trim() !== '');
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    try {
      console.log('Pago exitoso:', paymentIntent);
      await clearCart();
      router.push(`/checkout/success?payment_intent=${paymentIntent.id}`);
    } catch (err) {
      console.error('Error al procesar el pedido:', err);
      setError('Error al procesar el pedido');
    }
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  const renderCartSummary = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🛍️</span>
        <h3 className="text-xl font-semibold">Resumen del Pedido</h3>
      </div>
      
      <div className="space-y-4">
        {cart.items.map((item) => {
          const price = item.product?.price || 0;
          return (
            <div key={item.id} className="flex justify-between items-start border-b pb-3">
              <div className="flex-1">
                <h4 className="font-medium">{item.product?.name || 'Producto'}</h4>
                {item.size && <p className="text-sm text-gray-600">Talla: {item.size}</p>}
                {item.color && <p className="text-sm text-gray-600">Color: {item.color}</p>}
                <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
              </div>
              <p className="font-medium">${(price * item.quantity).toFixed(2)}</p>
            </div>
          );
        })}
        
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío:</span>
            <span>{shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between">
            <span>IVA (16%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderShippingForm = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xl">🚚</span>
        <h3 className="text-xl font-semibold">Información de Envío</h3>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre *</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={shippingInfo.firstName}
              onChange={(e) => handleShippingChange('firstName', e.target.value)}
              placeholder="Tu nombre"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Apellidos *</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={shippingInfo.lastName}
              onChange={(e) => handleShippingChange('lastName', e.target.value)}
              placeholder="Tus apellidos"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={shippingInfo.email}
            onChange={(e) => handleShippingChange('email', e.target.value)}
            placeholder="tu@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teléfono *</label>
          <input
            type="tel"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={shippingInfo.phone}
            onChange={(e) => handleShippingChange('phone', e.target.value)}
            placeholder="+593 99 123 4567"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Dirección *</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={shippingInfo.address}
            onChange={(e) => handleShippingChange('address', e.target.value)}
            placeholder="Calle, número, barrio"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ciudad *</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={shippingInfo.city}
              onChange={(e) => handleShippingChange('city', e.target.value)}
              placeholder="Ciudad"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Código Postal *</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={shippingInfo.zipCode}
              onChange={(e) => handleShippingChange('zipCode', e.target.value)}
              placeholder="170515"
              required
            />
          </div>
        </div>

        <div className="flex justify-between mt-6 gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Volver al Carrito
          </Button>
          <Button 
            onClick={createPaymentIntent}
            disabled={!validateShippingInfo() || loading}
          >
            {loading ? 'Procesando...' : 'Continuar al Pago'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xl">💳</span>
        <h3 className="text-xl font-semibold">Información de Pago</h3>
      </div>
      
      <PaymentMethodSelector
        clientSecret={clientSecret}
        amount={total}
        shippingInfo={shippingInfo}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
      
      <div className="flex justify-between mt-6 gap-4">
        <Button variant="outline" onClick={() => setCurrentStep(2)}>
          Volver a Envío
        </Button>
      </div>
    </div>
  );

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
            currentStep >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
          }`}>1</div>
          <span className="ml-2 font-medium">Carrito</span>
        </div>
        
        <div className="h-px w-12 bg-gray-300"></div>
        
        <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
            currentStep >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
          }`}>2</div>
          <span className="ml-2 font-medium">Envío</span>
        </div>
        
        <div className="h-px w-12 bg-gray-300"></div>
        
        <div className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
            currentStep >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
          }`}>3</div>
          <span className="ml-2 font-medium">Pago</span>
        </div>
      </div>
    </div>
  );

  if (getItemCount() === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🛍️</div>
          <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-4">Agrega algunos productos antes de proceder al checkout</p>
          <Button onClick={() => router.push('/shop')}>
            Ir a la Tienda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
      <StepIndicator />
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {currentStep === 2 && renderShippingForm()}
          {currentStep === 3 && renderPaymentForm()}
        </div>
        <div className="lg:col-span-1">
          {renderCartSummary()}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
