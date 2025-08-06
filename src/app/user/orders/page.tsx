'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { OrderStatus } from '@/types';

export default function OrdersPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { orders, loading, error, fetchOrders } = useOrders();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Redireccionar si no está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      redirect('/auth/login');
    }
  }, [authLoading, isAuthenticated]);

  // Filtrar pedidos por búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders({
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      search: searchTerm || undefined,
    });
  };

  // Filtrar por estado
  const handleStatusFilter = (status: OrderStatus | 'all') => {
    setSelectedStatus(status);
    fetchOrders({
      status: status === 'all' ? undefined : status,
      search: searchTerm || undefined,
    });
  };

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando historial de pedidos...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Historial de Pedidos
              </h1>
              <p className="mt-2 text-gray-600">
                Revisa el estado y detalles de todos tus pedidos
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              Seguir Comprando
            </Link>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Búsqueda */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por número de seguimiento o notas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span className="sr-only">Buscar</span>
                </button>
              </div>
            </form>

            {/* Filtro por estado */}
            <div className="sm:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusFilter(e.target.value as OrderStatus | 'all')}
                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmado</option>
                <option value="processing">Procesando</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
                <option value="refunded">Reembolsado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de pedidos */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay pedidos aún
            </h3>
            <p className="text-gray-500 mb-6">
              Cuando realices tu primera compra, aparecerá aquí.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700"
            >
              Explorar Productos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  {/* Header del pedido */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Pedido #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Productos comprados */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Productos comprados:</h4>
                    <div className="space-y-3">
                      {order.items && order.items.length > 0 ? (
                        order.items.slice(0, 3).map((item, index) => (
                          <div key={item.id || index} className="flex items-center space-x-3 py-2 px-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0">
                              {item.product_snapshot?.images?.[0] ? (
                                <Image
                                  src={item.product_snapshot.images[0]}
                                  alt={item.product_snapshot.name || 'Producto'}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 object-cover rounded-md"
                                  unoptimized
                                  onError={(e) => {
                                    // Fallback to placeholder if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center ${item.product_snapshot?.images?.[0] ? 'hidden' : ''}`}>
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium text-gray-900 truncate">
                                {item.product_snapshot?.name || 'Producto sin nombre'}
                              </h5>
                              {item.product_snapshot?.brand && (
                                <p className="text-xs text-gray-400 mb-1">{item.product_snapshot.brand}</p>
                              )}
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>Cantidad: {item.quantity}</span>
                                {item.size && <span>• Talla: {item.size}</span>}
                                {item.color && <span>• Color: {item.color}</span>}
                              </div>
                              {item.product_snapshot?.sku && (
                                <p className="text-xs text-gray-400 mt-1">SKU: {item.product_snapshot.sku}</p>
                              )}
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatPrice(item.total_price)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">No se encontraron detalles de productos</p>
                      )}
                      
                      {/* Mostrar si hay más productos */}
                      {order.items && order.items.length > 3 && (
                        <div className="text-center">
                          <p className="text-sm text-gray-500">
                            y {order.items.length - 3} producto{order.items.length - 3 > 1 ? 's' : ''} más...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer del pedido */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'artículo' : 'artículos'} en total
                      </p>
                      {order.tracking_number && (
                        <p className="text-sm text-gray-600">
                          Seguimiento: <span className="font-medium">{order.tracking_number}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
