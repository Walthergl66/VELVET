'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRole } from '@/hooks/useRole';

/**
 * Página principal de gestión de pedidos/órdenes
 * Permite listar, filtrar, buscar y gestionar todos los pedidos
 */

interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  total: number;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
  
  // Datos relacionados - Supabase devuelve objetos únicos, no arrays
  user_profiles: {
    email: string;
    full_name?: string;
  } | null;
  shipping_address: any;
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    product_variants: {
      id: string;
      sku: string;
      products: {
        name: string;
      };
    };
  }>;
}

interface FilterOptions {
  status: string;
  payment_status: string;
  date_from: string;
  date_to: string;
  search: string;
}

export default function OrdersPage() {
  const { role, isLoading } = useRole();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros y paginación
  const [filters, setFilters] = useState<FilterOptions>({
    status: '',
    payment_status: '',
    date_from: '',
    date_to: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const ordersPerPage = 20;

  // Estados para acciones
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir query base
      let query = supabase
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
          created_at,
          updated_at,
          user_profiles!inner(email, full_name),
          shipping_address,
          order_items(
            id,
            quantity,
            unit_price,
            product_variants(
              id,
              sku,
              products(name)
            )
          )
        `, { count: 'exact' });

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.payment_status) {
        query = query.eq('payment_status', filters.payment_status);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to + 'T23:59:59');
      }
      if (filters.search) {
        query = query.or(`user_profiles.email.ilike.%${filters.search}%,user_profiles.full_name.ilike.%${filters.search}%,id.ilike.%${filters.search}%`);
      }

      // Paginación
      const from = (currentPage - 1) * ordersPerPage;
      const to = from + ordersPerPage - 1;

      const { data, error: fetchError, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (fetchError) throw fetchError;

      // TypeScript cast para resolver tipos de Supabase
      setOrders((data as unknown as Order[]) || []);
      setTotalOrders(count || 0);
      setTotalPages(Math.ceil((count || 0) / ordersPerPage));

    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Actualizar estado local
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ));

      // Mostrar mensaje de éxito (puedes agregar toast aquí)
      console.log(`Pedido ${orderId} actualizado a ${newStatus}`);

    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Error al actualizar el estado del pedido');
    }
  };

  const updatePaymentStatus = async (orderId: string, newPaymentStatus: Order['payment_status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: newPaymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, payment_status: newPaymentStatus, updated_at: new Date().toISOString() }
          : order
      ));

    } catch (err) {
      console.error('Error updating payment status:', err);
      alert('Error al actualizar el estado del pago');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return;

    if (bulkAction === 'delete') {
      if (!confirm(`¿Estás seguro de que quieres eliminar ${selectedOrders.length} pedidos?`)) return;
      
      try {
        const { error } = await supabase
          .from('orders')
          .delete()
          .in('id', selectedOrders);

        if (error) throw error;

        setOrders(orders.filter(order => !selectedOrders.includes(order.id)));
        setSelectedOrders([]);
        setBulkAction('');
      } catch (err) {
        console.error('Error deleting orders:', err);
        alert('Error al eliminar pedidos');
      }
    } else {
      // Actualizar estado en lote
      try {
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: bulkAction as Order['status'],
            updated_at: new Date().toISOString()
          })
          .in('id', selectedOrders);

        if (error) throw error;

        setOrders(orders.map(order => 
          selectedOrders.includes(order.id)
            ? { ...order, status: bulkAction as Order['status'], updated_at: new Date().toISOString() }
            : order
        ));
        setSelectedOrders([]);
        setBulkAction('');
      } catch (err) {
        console.error('Error updating orders:', err);
        alert('Error al actualizar pedidos');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h1>
          <p className="text-gray-600">
            Administra todos los pedidos y órdenes de la tienda
          </p>
        </div>
        
        {/* Export/Import actions */}
        <div className="flex items-center space-x-2">
          <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
            📊 Exportar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado del Pedido
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
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
              value={filters.payment_status}
              onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
              <option value="failed">Fallido</option>
              <option value="refunded">Reembolsado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="ID, email, nombre..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setFilters({
              status: '',
              payment_status: '',
              date_from: '',
              date_to: '',
              search: ''
            })}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Limpiar filtros
          </button>

          <div className="text-sm text-gray-600">
            Mostrando {orders.length} de {totalOrders} pedidos
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedOrders.length} pedidos seleccionados
            </span>
            <div className="flex items-center space-x-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 border border-blue-300 rounded-md text-sm"
              >
                <option value="">Seleccionar acción</option>
                <option value="confirmed">Marcar como confirmado</option>
                <option value="processing">Marcar como procesando</option>
                <option value="shipped">Marcar como enviado</option>
                <option value="delivered">Marcar como entregado</option>
                <option value="cancelled">Marcar como cancelado</option>
                {role === 'admin' && <option value="delete">Eliminar</option>}
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Aplicar
              </button>
              <button
                onClick={() => setSelectedOrders([])}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Deseleccionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando pedidos...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <button
              onClick={fetchOrders}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Reintentar
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron pedidos con los filtros aplicados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === orders.length && orders.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(orders.map(order => order.id));
                        } else {
                          setSelectedOrders([]);
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID / Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Productos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders([...selectedOrders, order.id]);
                          } else {
                            setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id.slice(-8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.user_profiles?.email || 'Email no disponible'}
                        </div>
                        {order.user_profiles?.full_name && (
                          <div className="text-sm text-gray-500">
                            {order.user_profiles.full_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.order_items.length} artículo{order.order_items.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-gray-500 max-w-xs truncate">
                        {order.order_items.map(item => 
                          `${item.product_variants.products.name} (${item.quantity})`
                        ).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.total)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Sub: {formatCurrency(order.subtotal)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                        className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="confirmed">Confirmado</option>
                        <option value="processing">Procesando</option>
                        <option value="shipped">Enviado</option>
                        <option value="delivered">Entregado</option>
                        <option value="cancelled">Cancelado</option>
                        <option value="refunded">Reembolsado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.payment_status}
                        onChange={(e) => updatePaymentStatus(order.id, e.target.value as Order['payment_status'])}
                        className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getPaymentStatusColor(order.payment_status)}`}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="paid">Pagado</option>
                        <option value="failed">Fallido</option>
                        <option value="refunded">Reembolsado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Ver detalles
                      </Link>
                      {role === 'admin' && (
                        <button
                          onClick={() => {
                            if (confirm('¿Estás seguro de que quieres eliminar este pedido?')) {
                              // Implementar eliminación individual
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{' '}
                <span className="font-medium">{(currentPage - 1) * ordersPerPage + 1}</span>
                {' '}a{' '}
                <span className="font-medium">
                  {Math.min(currentPage * ordersPerPage, totalOrders)}
                </span>
                {' '}de{' '}
                <span className="font-medium">{totalOrders}</span>
                {' '}resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  ‹
                </button>
                
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === page
                          ? 'bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  ›
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
