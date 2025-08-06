'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Order, OrderStatus } from '@/types';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { getOrderById } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redireccionar si no está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      redirect('/auth/login');
    }
  }, [authLoading, isAuthenticated]);

  // Cargar detalles del pedido
  useEffect(() => {
    const loadOrder = async () => {
      if (!id || typeof id !== 'string') {
        setError('ID de pedido inválido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const orderData = await getOrderById(id);
        
        if (!orderData) {
          setError('Pedido no encontrado');
        } else {
          setOrder(orderData);
        }
      } catch (err) {
        console.error('Error loading order:', err);
        setError('Error al cargar el pedido');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadOrder();
    }
  }, [id, getOrderById, isAuthenticated]);

  // Función para obtener el color del badge según el estado
  const getStatusBadgeColor = (status: OrderStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Función para obtener el texto del estado en español
  const getStatusText = (status: OrderStatus) => {
    const texts = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado',
    };
    return texts[status] || status;
  };

  // Función para formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  // Función para calcular el progreso del pedido
  const getOrderProgress = (status: OrderStatus) => {
    const progressMap = {
      pending: 0,
      confirmed: 25,
      processing: 50,
      shipped: 75,
      delivered: 100,
      cancelled: 0,
      refunded: 0,
    };
    return progressMap[status] || 0;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando detalles del pedido...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error || 'Pedido no encontrado'}
          </h3>
          <Link
            href="/user/orders"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700"
          >
            Volver al Historial
          </Link>
        </div>
      </div>
    );
  }

  const progress = getOrderProgress(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/user/orders"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al historial
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Pedido #{order.id.slice(-8).toUpperCase()}
              </h1>
              <p className="mt-2 text-gray-600">
                Realizado el {formatDate(order.created_at)}
              </p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        {/* Progreso del pedido */}
        {order.status !== 'cancelled' && order.status !== 'refunded' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Progreso del Pedido</h2>
            <div className="relative">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                <div 
                  style={{ width: `${progress}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pink-500 transition-all duration-500"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Confirmado</span>
                <span>Procesando</span>
                <span>Enviado</span>
                <span>Entregado</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Detalles principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Artículos del pedido */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Artículos Pedidos</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0 w-16 h-16">
                        <Image
                          src={item.product_snapshot.images?.[0] || '/placeholder-product.jpg'}
                          alt={item.product_snapshot.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {item.product_snapshot.name}
                        </h3>
                        <div className="text-sm text-gray-500 space-y-1">
                          {item.size && <p>Talla: {item.size}</p>}
                          {item.color && <p>Color: {item.color}</p>}
                          <p>Cantidad: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(item.total_price)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatPrice(item.unit_price)} c/u
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Información de envío */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Información de Envío</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Dirección de Envío</h3>
                    <div className="text-sm text-gray-600">
                      <p>{order.shipping_address.street}</p>
                      <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                      <p>{order.shipping_address.zip_code}</p>
                      <p>{order.shipping_address.country}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Dirección de Facturación</h3>
                    <div className="text-sm text-gray-600">
                      <p>{order.billing_address.street}</p>
                      <p>{order.billing_address.city}, {order.billing_address.state}</p>
                      <p>{order.billing_address.zip_code}</p>
                      <p>{order.billing_address.country}</p>
                    </div>
                  </div>
                </div>
                {order.tracking_number && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Número de seguimiento:</span> {order.tracking_number}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resumen lateral */}
          <div className="space-y-6">
            {/* Resumen del pedido */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Resumen del Pedido</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío</span>
                    <span className="text-gray-900">{formatPrice(order.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Impuestos</span>
                    <span className="text-gray-900">{formatPrice(order.tax)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Descuento</span>
                      <span className="text-green-600">-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-medium text-gray-900">Total</span>
                      <span className="text-base font-medium text-gray-900">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Método de pago */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Método de Pago</h2>
              </div>
              <div className="p-6">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {order.payment_method.type === 'credit_card' ? 'Tarjeta de Crédito' :
                     order.payment_method.type === 'debit_card' ? 'Tarjeta de Débito' :
                     order.payment_method.type === 'paypal' ? 'PayPal' :
                     order.payment_method.type === 'stripe' ? 'Stripe' :
                     order.payment_method.type === 'mercadopago' ? 'MercadoPago' :
                     'Método de Pago'}
                  </p>
                  {order.payment_method.last4 && (
                    <p className="text-gray-600">
                      **** **** **** {order.payment_method.last4}
                    </p>
                  )}
                  <p className="text-gray-600 capitalize">
                    Estado: {order.payment_status}
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <div className="space-y-3">
                  <Link
                    href="/user/orders"
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  >
                    Volver al Historial
                  </Link>
                  {order.status === 'delivered' && (
                    <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                      Reordenar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notas del pedido */}
        {order.notes && (
          <div className="mt-6 bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Notas del Pedido</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
