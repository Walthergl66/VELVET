'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useRole } from '@/hooks/useRole';

/**
 * Página de detalles de un pedido específico
 * Permite ver toda la información y gestionar el estado del pedido
 */

interface OrderDetail {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  total: number;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
  
  // Datos relacionados
  user_profiles: {
    email: string;
    full_name?: string;
    phone?: string;
  };
  shipping_address: {
    full_name: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    phone?: string;
  };
  billing_address?: {
    full_name: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    product_variants: {
      id: string;
      sku: string;
      image_url?: string;
      products: {
        name: string;
        description?: string;
      };
      variant_option_values: Array<{
        product_option_values: {
          value: string;
          product_options: {
            name: string;
          };
        };
      }>;
    };
  }>;
}

interface OrderHistory {
  id: string;
  order_id: string;
  status: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { role, isLoading } = useRole();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para edición
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    payment_status: '',
    tracking_number: '',
    notes: ''
  });

  useEffect(() => {
    fetchOrderDetail();
    fetchOrderHistory();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          status,
          total,
          subtotal,
          tax,
          shipping_cost,
          payment_method,
          payment_status,
          notes,
          tracking_number,
          created_at,
          updated_at,
          user_profiles(email, full_name, phone),
          shipping_address,
          billing_address,
          order_items(
            id,
            quantity,
            unit_price,
            product_variants(
              id,
              sku,
              image_url,
              products(name, description),
              variant_option_values(
                product_option_values(
                  value,
                  product_options(name)
                )
              )
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Pedido no encontrado');

      setOrder(data as any);
      setEditData({
        status: data.status,
        payment_status: data.payment_status,
        tracking_number: data.tracking_number || '',
        notes: data.notes || ''
      });

    } catch (err) {
      console.error('Error fetching order detail:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el pedido');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const { data } = await supabase
        .from('order_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      setOrderHistory(data || []);
    } catch (err) {
      console.error('Error fetching order history:', err);
    }
  };

  const updateOrder = async () => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: editData.status,
          payment_status: editData.payment_status,
          tracking_number: editData.tracking_number || null,
          notes: editData.notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Crear entrada en el historial
      if (order && (editData.status !== order.status || editData.payment_status !== order.payment_status)) {
        await supabase
          .from('order_history')
          .insert({
            order_id: orderId,
            status: editData.status !== order.status ? editData.status : null,
            payment_status: editData.payment_status !== order.payment_status ? editData.payment_status : null,
            notes: `Estado actualizado por administrador`,
            created_by: 'admin' // Aquí podrías usar el ID del admin actual
          });
      }

      await fetchOrderDetail();
      await fetchOrderHistory();
      setIsEditing(false);

      // Mostrar mensaje de éxito
      alert('Pedido actualizado correctamente');

    } catch (err) {
      console.error('Error updating order:', err);
      alert('Error al actualizar el pedido');
    }
  };

  const generateInvoice = async () => {
    try {
      // Implementar generación de factura
      alert('Función de generar factura en desarrollo');
    } catch (err) {
      console.error('Error generating invoice:', err);
      alert('Error al generar la factura');
    }
  };

  const printShippingLabel = async () => {
    try {
      // Implementar impresión de etiqueta de envío
      alert('Función de imprimir etiqueta en desarrollo');
    } catch (err) {
      console.error('Error printing shipping label:', err);
      alert('Error al imprimir la etiqueta');
    }
  };

  const refundOrder = async () => {
    if (!confirm('¿Estás seguro de que quieres reembolsar este pedido?')) return;

    try {
      // Implementar lógica de reembolso
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'refunded',
          payment_status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      await fetchOrderDetail();
      alert('Pedido reembolsado correctamente');

    } catch (err) {
      console.error('Error refunding order:', err);
      alert('Error al procesar el reembolso');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendiente',
      paid: 'Pagado',
      failed: 'Fallido',
      refunded: 'Reembolsado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">
            {error || 'Pedido no encontrado'}
          </div>
          <Link
            href="/admin/orders"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Volver a pedidos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/orders"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Volver a pedidos
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Pedido #{order.id.slice(-8)}
            </h1>
            <p className="text-gray-600">
              Creado el {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={generateInvoice}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            📄 Factura
          </button>
          <button
            onClick={printShippingLabel}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            🏷️ Etiqueta
          </button>
          {(order.status !== 'refunded' && order.payment_status === 'paid') && (
            <button
              onClick={refundOrder}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              💸 Reembolsar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Productos ({order.order_items.length} artículo{order.order_items.length !== 1 ? 's' : ''})
            </h3>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  {item.product_variants.image_url && (
                    <img
                      src={item.product_variants.image_url}
                      alt={item.product_variants.products.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {item.product_variants.products.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      SKU: {item.product_variants.sku}
                    </p>
                    {item.product_variants.variant_option_values.length > 0 && (
                      <div className="text-sm text-gray-600">
                        {item.product_variants.variant_option_values.map((option, index) => (
                          <span key={index}>
                            {option.product_option_values.product_options.name}: {option.product_option_values.value}
                            {index < item.product_variants.variant_option_values.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(item.unit_price)} × {item.quantity}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total: {formatCurrency(item.unit_price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Impuestos:</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío:</span>
                  <span>{formatCurrency(order.shipping_cost)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información del Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Datos del Cliente</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>{order.user_profiles.full_name || 'Nombre no disponible'}</p>
                  <p>{order.user_profiles.email}</p>
                  {order.user_profiles.phone && <p>{order.user_profiles.phone}</p>}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Dirección de Envío</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>{order.shipping_address.full_name}</p>
                  <p>{order.shipping_address.address_line_1}</p>
                  {order.shipping_address.address_line_2 && (
                    <p>{order.shipping_address.address_line_2}</p>
                  )}
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.state}
                  </p>
                  <p>
                    {order.shipping_address.postal_code}, {order.shipping_address.country}
                  </p>
                  {order.shipping_address.phone && <p>{order.shipping_address.phone}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Estado del Pedido
            </h3>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado del Pedido
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="processing">Procesando</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregado</option>
                    <option value="cancelled">Cancelado</option>
                    <option value="refunded">Reembolsado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado del Pago
                  </label>
                  <select
                    value={editData.payment_status}
                    onChange={(e) => setEditData({ ...editData, payment_status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagado</option>
                    <option value="failed">Fallido</option>
                    <option value="refunded">Reembolsado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Seguimiento
                  </label>
                  <input
                    type="text"
                    value={editData.tracking_number}
                    onChange={(e) => setEditData({ ...editData, tracking_number: e.target.value })}
                    placeholder="Número de tracking..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    placeholder="Notas adicionales..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={updateOrder}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Estado:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Pago:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                      {getPaymentStatusLabel(order.payment_status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Método de Pago:</span>
                    <span className="text-sm text-gray-600">{order.payment_method}</span>
                  </div>
                  {order.tracking_number && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Tracking:</span>
                      <span className="text-sm text-gray-600">{order.tracking_number}</span>
                    </div>
                  )}
                  {order.notes && (
                    <div className="mt-3">
                      <span className="text-sm font-medium text-gray-700">Notas:</span>
                      <p className="text-sm text-gray-600 mt-1">{order.notes}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Editar Estado
                </button>
              </div>
            )}
          </div>

          {/* Order History */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Historial de Estados
            </h3>
            <div className="space-y-3">
              {orderHistory.length > 0 ? (
                orderHistory.map((history) => (
                  <div key={history.id} className="border-l-2 border-blue-500 pl-3">
                    <div className="text-sm font-medium text-gray-900">
                      {history.status}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(history.created_at)}
                    </div>
                    {history.notes && (
                      <div className="text-xs text-gray-600 mt-1">
                        {history.notes}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No hay historial disponible
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
