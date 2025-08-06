'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useAddresses } from '@/hooks/useAddresses';
import { supabase } from '@/lib/supabase';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import AddressSelector from '@/components/checkout/AddressSelector';
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
  
  // Hook para manejar direcciones guardadas
  const { 
    addresses, 
    selectedShippingAddress, 
    // selectedBillingAddress, // Para uso futuro
    loading: addressesLoading,
    setSelectedShippingAddress,
    // setSelectedBillingAddress // Para uso futuro
  } = useAddresses();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Estados para controlar si usar direcciones guardadas o nueva dirección
  const [useNewShippingAddress, setUseNewShippingAddress] = useState(false);
  // const [useNewBillingAddress, setUseNewBillingAddress] = useState(false); // Para uso futuro
  
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
  // Ajuste para Ecuador: envío gratis en compras mayores a $100 USD
  const shipping = subtotal > 100 ? 0 : 15; // $15 USD envío estándar en Ecuador
  const tax = subtotal * 0.12; // IVA 12% en Ecuador
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

  // Establecer dirección por defecto cuando se cargan las direcciones
  useEffect(() => {
    if (addresses.length > 0 && !selectedShippingAddress && !useNewShippingAddress) {
      // Seleccionar la dirección por defecto o la primera disponible
      const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];
      setSelectedShippingAddress(defaultAddress);
    }
  }, [addresses, selectedShippingAddress, useNewShippingAddress, setSelectedShippingAddress]);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      setError('');

      // Verificar stock antes de procesar el pago
      console.log('🔍 Verificando disponibilidad de stock...');
      for (const item of cart.items) {
        if (item.product_id) {
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('stock, name')
            .eq('id', item.product_id)
            .single();

          if (productError) {
            throw new Error(`Error verificando producto: ${productError.message}`);
          }

          if (product.stock < item.quantity) {
            throw new Error(`Stock insuficiente para "${product.name}". Stock disponible: ${product.stock}, cantidad solicitada: ${item.quantity}`);
          }
        }

        if (item.variant_id) {
          const { data: variant, error: variantError } = await supabase
            .from('product_variants')
            .select('stock')
            .eq('id', item.variant_id)
            .single();

          if (variantError) {
            throw new Error(`Error verificando variante: ${variantError.message}`);
          }

          if (variant.stock < item.quantity) {
            throw new Error(`Stock insuficiente para la variante seleccionada. Stock disponible: ${variant.stock}, cantidad solicitada: ${item.quantity}`);
          }
        }
      }
      console.log('✅ Stock verificado correctamente');

      // Preparar información de items del carrito
      const cartItems = cart.items.map(item => ({
        productId: item.product_id,
        name: item.product?.name || 'Producto',
        price: item.product?.price || 0,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        total: (item.product?.price || 0) * item.quantity
      }));

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: 'usd',
          metadata: {
            orderId: `order_${Date.now()}`,
            userId: user?.id || 'guest',
          },
          shippingInfo: getCurrentShippingInfo(),
          cartItems: cartItems
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
    // Si está usando una dirección guardada y está seleccionada, es válido
    if (!useNewShippingAddress && selectedShippingAddress) {
      // Verificar que la dirección seleccionada tenga los campos mínimos requeridos
      return !!(
        selectedShippingAddress.street &&
        selectedShippingAddress.city &&
        selectedShippingAddress.zip_code &&
        user?.email // El email viene del usuario autenticado
      );
    }
    
    // Si está usando el formulario manual, validar todos los campos
    if (useNewShippingAddress || addresses.length === 0) {
      const currentInfo = getCurrentShippingInfo();
      const required = ['firstName', 'lastName', 'email', 'address', 'city', 'zipCode', 'phone'];
      return required.every(field => {
        const value = currentInfo[field as keyof ShippingInfo];
        return value && value.trim() !== '';
      });
    }
    
    // Si no hay dirección seleccionada y no está usando formulario manual, no es válido
    return false;
  };

  // Función auxiliar para obtener la dirección actual de envío
  const getCurrentShippingInfo = () => {
    if (!useNewShippingAddress && selectedShippingAddress) {
      return {
        firstName: user?.user_metadata?.first_name || '',
        lastName: user?.user_metadata?.last_name || '',
        email: user?.email || '',
        address: selectedShippingAddress.street || '',
        city: selectedShippingAddress.city || '',
        zipCode: selectedShippingAddress.zip_code || '',
        country: selectedShippingAddress.country || 'Ecuador',
        phone: user?.user_metadata?.phone || ''
      };
    }
    return shippingInfo;
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    console.log('🎉 INICIANDO PROCESO DE CREACIÓN DE ORDEN...');
    console.log('📋 Pago exitoso:', paymentIntent);
    console.log('👤 Usuario actual:', user);
    console.log('🛒 Items del carrito:', cart.items);
    
    try {
      // Verificar sesión de Supabase
      console.log('🔍 Verificando sesión de Supabase...');
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      console.log('🔑 Sesión de Supabase:', session);
      if (sessionError) {
        console.error('❌ Error obteniendo sesión:', sessionError);
        throw new Error(`Error de sesión: ${sessionError.message}`);
      }
      
      // Validar que tenemos usuario autenticado
      console.log('✅ Validando usuario autenticado...');
      if (!user?.id) {
        console.error('❌ Usuario no autenticado');
        throw new Error('Usuario no autenticado. Necesitas estar logueado para crear una orden.');
      }
      console.log('✅ Usuario validado:', user.id);

      // Validar que hay items en el carrito
      console.log('🛒 Validando items del carrito...');
      if (!cart.items || cart.items.length === 0) {
        console.error('❌ Carrito vacío');
        throw new Error('No hay items en el carrito para crear la orden.');
      }
      console.log('✅ Carrito validado:', cart.items.length, 'items');
      
      // Crear la orden en la base de datos
      console.log('📦 Preparando datos de la orden...');
      const orderData = {
        user_id: user.id,
        status: 'confirmed',
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        shipping: Number(shipping.toFixed(2)),
        discount: 0,
        total: Number(total.toFixed(2)),
        shipping_address: shippingInfo,
        billing_address: shippingInfo, // Usando la misma dirección para billing
        payment_method: {
          type: 'stripe',
          payment_intent_id: paymentIntent.id,
          payment_method: paymentIntent.payment_method,
          status: paymentIntent.status
        },
        payment_status: 'completed',
        payment_id: paymentIntent.id
      };

      console.log('📋 Datos de la orden a crear:', JSON.stringify(orderData, null, 2));

      // Crear la orden principal
      console.log('💾 Insertando orden en la base de datos...');
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) {
        console.error('❌ Error detallado creando orden:', JSON.stringify(orderError, null, 2));
        throw new Error(`Error al crear la orden: ${orderError.message} (Código: ${orderError.code})`);
      }

      console.log('✅ Orden creada exitosamente:', order);

      // Crear los items de la orden
      console.log('📦 Preparando items de la orden...');
      const orderItems = cart.items.map(item => {
        console.log('🔄 Procesando item:', item);
        return {
          order_id: order.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_snapshot: {
            name: item.product?.name || 'Producto sin nombre',
            description: item.product?.description || '',
            images: item.product?.images || [],
            brand: item.product?.brand || '',
            sku: item.product?.sku || ''
          },
          quantity: item.quantity,
          size: item.size || null,
          color: item.color || null,
          unit_price: Number((item.product?.price || 0).toFixed(2)),
          total_price: Number(((item.product?.price || 0) * item.quantity).toFixed(2))
        };
      });

      console.log('📋 Items de orden a crear:', JSON.stringify(orderItems, null, 2));

      console.log('💾 Insertando items en la base de datos...');
      const { data: createdItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();

      if (itemsError) {
        console.error('❌ Error detallado creando items:', JSON.stringify(itemsError, null, 2));
        throw new Error(`Error al crear los items de la orden: ${itemsError.message} (Código: ${itemsError.code})`);
      }

      console.log('✅ Items de orden creados exitosamente:', createdItems);

      // Actualizar inventario de productos y variantes
      console.log('📦 Actualizando inventario...');
      for (const item of cart.items) {
        try {
          // Actualizar stock del producto principal
          if (item.product_id) {
            console.log(`🔄 Actualizando stock del producto ${item.product_id}, descontando ${item.quantity} unidades`);
            
            // Primero verificamos el stock actual
            const { data: currentProduct, error: fetchError } = await supabase
              .from('products')
              .select('stock')
              .eq('id', item.product_id)
              .single();

            if (fetchError) {
              console.error(`❌ Error obteniendo stock del producto ${item.product_id}:`, fetchError);
              continue;
            }

            if (currentProduct.stock < item.quantity) {
              console.error(`❌ Stock insuficiente para producto ${item.product_id}. Stock actual: ${currentProduct.stock}, requerido: ${item.quantity}`);
              continue;
            }

            // Actualizar el stock
            const { data: productUpdate, error: productError } = await supabase
              .from('products')
              .update({ 
                stock: currentProduct.stock - item.quantity,
                updated_at: new Date().toISOString()
              })
              .eq('id', item.product_id)
              .select();

            if (productError) {
              console.error(`❌ Error actualizando stock del producto ${item.product_id}:`, productError);
            } else {
              console.log(`✅ Stock del producto ${item.product_id} actualizado. Nuevo stock: ${currentProduct.stock - item.quantity}`);
            }
          }

          // Actualizar stock de la variante si existe
          if (item.variant_id) {
            console.log(`🔄 Actualizando stock de la variante ${item.variant_id}, descontando ${item.quantity} unidades`);
            
            // Primero verificamos el stock actual de la variante
            const { data: currentVariant, error: fetchVariantError } = await supabase
              .from('product_variants')
              .select('stock')
              .eq('id', item.variant_id)
              .single();

            if (fetchVariantError) {
              console.error(`❌ Error obteniendo stock de la variante ${item.variant_id}:`, fetchVariantError);
              continue;
            }

            if (currentVariant.stock < item.quantity) {
              console.error(`❌ Stock insuficiente para variante ${item.variant_id}. Stock actual: ${currentVariant.stock}, requerido: ${item.quantity}`);
              continue;
            }

            // Actualizar el stock de la variante
            const { data: variantUpdate, error: variantError } = await supabase
              .from('product_variants')
              .update({ 
                stock: currentVariant.stock - item.quantity,
                updated_at: new Date().toISOString()
              })
              .eq('id', item.variant_id)
              .select();

            if (variantError) {
              console.error(`❌ Error actualizando stock de la variante ${item.variant_id}:`, variantError);
            } else {
              console.log(`✅ Stock de la variante ${item.variant_id} actualizado. Nuevo stock: ${currentVariant.stock - item.quantity}`);
            }
          }
        } catch (inventoryError) {
          console.error(`❌ Error general actualizando inventario para item ${item.id}:`, inventoryError);
          // Continuamos con el siguiente item
        }
      }
      
      console.log('✅ Actualización de inventario completada');

      // Limpiar el carrito y redirigir
      console.log('🧹 Limpiando carrito...');
      await clearCart();
      
      // Nota: Las estadísticas del usuario se actualizarán automáticamente 
      // cuando el usuario visite la página de éxito del checkout
      console.log('📊 Las estadísticas del usuario se actualizarán automáticamente');
      
      console.log('🚀 Redirigiendo a página de éxito...');
      router.push(`/checkout/success?payment_intent=${paymentIntent.id}&order_id=${order.id}`);
      
    } catch (err) {
      console.error('💥 ERROR COMPLETO al procesar el pedido:');
      console.error('📍 Mensaje del error:', err instanceof Error ? err.message : 'Error desconocido');
      console.error('📍 Stack trace:', err instanceof Error ? err.stack : 'No stack trace');
      console.error('📍 Tipo de error:', typeof err);
      console.error('📍 Error completo:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al procesar el pedido';
      setError(`Error al procesar el pedido: ${errorMessage}`);
      
      // Mostrar alerta para el usuario
      alert(`❌ Error: ${errorMessage}`);
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
      
      <div className="space-y-6">
        {/* Selector de direcciones guardadas */}
        {addresses.length > 0 && (
          <div>
            <label className="block text-base font-bold mb-3 text-gray-900">
              Seleccionar dirección guardada
            </label>
            <AddressSelector
              title="Direcciones de envío"
              addresses={addresses}
              selectedAddress={useNewShippingAddress ? null : selectedShippingAddress}
              onSelectAddress={(address) => {
                if (address === null) {
                  // Usuario seleccionó "Ingresar nueva dirección"
                  setUseNewShippingAddress(true);
                  setSelectedShippingAddress(null);
                } else {
                  // Usuario seleccionó una dirección guardada
                  setSelectedShippingAddress(address);
                  setUseNewShippingAddress(false);
                }
              }}
              onAddNewAddress={() => {
                setUseNewShippingAddress(true);
                setSelectedShippingAddress(null);
              }}
              loading={addressesLoading}
            />
            
            {selectedShippingAddress && !useNewShippingAddress && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">
                  ✓ Dirección seleccionada. Los datos se completarán automáticamente.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setUseNewShippingAddress(true);
                    setSelectedShippingAddress(null);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm underline mt-1"
                >
                  Usar una dirección diferente
                </button>
              </div>
            )}
          </div>
        )}

        {/* Formulario manual (se muestra si no hay direcciones guardadas o si elige "nueva dirección") */}
        {(addresses.length === 0 || useNewShippingAddress) && (
          <div className="space-y-4">
            {addresses.length > 0 && useNewShippingAddress && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-600 mb-2">
                  📝 Complete todos los campos para continuar
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setUseNewShippingAddress(false);
                    setSelectedShippingAddress(addresses.find(addr => addr.is_default) || addresses[0] || null);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  ← Volver a direcciones guardadas
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-bold mb-2 text-gray-900">Nombre *</label>
                <input
                  type="text"
                  className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                  value={shippingInfo.firstName}
                  onChange={(e) => handleShippingChange('firstName', e.target.value)}
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div>
                <label className="block text-base font-bold mb-2 text-gray-900">Apellidos *</label>
                <input
                  type="text"
                  className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                  value={shippingInfo.lastName}
                  onChange={(e) => handleShippingChange('lastName', e.target.value)}
                  placeholder="Tus apellidos"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-base font-bold mb-2 text-gray-900">Email *</label>
              <input
                type="email"
                className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                value={shippingInfo.email}
                onChange={(e) => handleShippingChange('email', e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-base font-bold mb-2 text-gray-900">Teléfono *</label>
              <input
                type="tel"
                className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                value={shippingInfo.phone}
                onChange={(e) => handleShippingChange('phone', e.target.value)}
                placeholder="+593 99 123 4567"
                required
              />
            </div>

            <div>
              <label className="block text-base font-bold mb-2 text-gray-900">Dirección *</label>
              <input
                type="text"
                className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                value={shippingInfo.address}
                onChange={(e) => handleShippingChange('address', e.target.value)}
                placeholder="Calle, número, barrio"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-bold mb-2 text-gray-900">Ciudad *</label>
                <input
                  type="text"
                  className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                  value={shippingInfo.city}
                  onChange={(e) => handleShippingChange('city', e.target.value)}
                  placeholder="Ciudad"
                  required
                />
              </div>
              <div>
                <label className="block text-base font-bold mb-2 text-gray-900">Código Postal *</label>
                <input
                  type="text"
                  className="w-full p-3 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                  value={shippingInfo.zipCode}
                  onChange={(e) => handleShippingChange('zipCode', e.target.value)}
                  placeholder="170515"
                  required
                />
              </div>
            </div>
          </div>
        )}

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
        shippingInfo={getCurrentShippingInfo()}
        onSuccess={(paymentIntent) => {
          console.log('🔥 PaymentMethodSelector onSuccess ejecutado con:', paymentIntent);
          handlePaymentSuccess(paymentIntent);
        }}
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
