'use client';

import React, { useState, useEffect } from 'react';
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
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: any; // JSON con información del método de pago
  created_at: string;
  updated_at: string;
  
  // Datos relacionados - solo user_profiles ahora
  user_profiles?: {
    email: string;
    first_name?: string;
    last_name?: string;
  } | null;
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
  const [authUser, setAuthUser] = useState<any>(null);
  
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

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      setAuthUser(user);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (authUser && role === 'admin') {
      loadOrders();
    }
  }, [currentPage, filters, authUser, role]);



  // Función principal para cargar pedidos siguiendo el patrón de users
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir query base con campos esenciales
      let query = supabase
        .from('orders')
        .select(`
          id,
          user_id,
          status,
          payment_status,
          payment_method,
          total,
          subtotal,
          created_at,
          updated_at,
          user_profiles(email, first_name, last_name)
        `, { count: 'exact' });

      // Aplicar filtros de búsqueda
      if (filters.search) {
        query = query.or(`id.ilike.%${filters.search}%,user_profiles.email.ilike.%${filters.search}%,user_profiles.first_name.ilike.%${filters.search}%,user_profiles.last_name.ilike.%${filters.search}%`);
      }

      // Aplicar filtros específicos
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

      // Paginación
      const from = (currentPage - 1) * ordersPerPage;
      const to = from + ordersPerPage - 1;

      const { data, error: queryError, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (queryError) {
        throw new Error(`Error al obtener pedidos: ${queryError.message}`);
      }

      // Asegurar que los datos tengan la estructura correcta
      const ordersWithDefaults = (data || []).map(order => ({
        ...order,
        user_profiles: order.user_profiles || null
      }));

      setOrders(ordersWithDefaults as unknown as Order[]);
      setTotalOrders(count || 0);
      setTotalPages(Math.ceil((count || 0) / ordersPerPage));

    } catch (err) {
      console.error('Error loading orders:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar pedidos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };





  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-EC', {
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

  const getPaymentMethod = (paymentMethod: any) => {
    if (!paymentMethod) return 'No especificado';
    
    const getMethodFromString = (method: string) => {
      if (method === 'stripe') return 'Stripe';
      if (method === 'paypal') return 'PayPal';
      return method;
    };
    
    const getMethodFromObject = (method: any) => {
      if (method.type === 'stripe' || method.brand || method.last4) return 'Stripe';
      if (method.type === 'paypal' || method.paypal_email) return 'PayPal';
      if (method.type) return getMethodFromString(method.type);
      return 'Otro método';
    };
    
    if (typeof paymentMethod === 'string') {
      return getMethodFromString(paymentMethod);
    }
    
    if (typeof paymentMethod === 'object') {
      return getMethodFromObject(paymentMethod);
    }
    
    return 'Otro método';
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
          <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Estado del Pedido
            </label>
            <select
              id="status-filter"
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
            <label htmlFor="payment-status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Estado del Pago
            </label>
            <select
              id="payment-status-filter"
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
            <label htmlFor="date-from-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Desde
            </label>
            <input
              id="date-from-filter"
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="date-to-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Hasta
            </label>
            <input
              id="date-to-filter"
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              id="search-filter"
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
            {authUser && <div className="text-xs">Usuario autenticado: {authUser.email}</div>}
            {role && <div className="text-xs">Rol: {role}</div>}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando pedidos...</p>
          </div>
        )}
        
        {!loading && error && (
          <div className="p-8 text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <div className="space-y-2">
              <button
                onClick={loadOrders}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}
        
        {!loading && !error && orders.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pedidos</h3>
            <p className="text-gray-500 mb-4">
              No se encontraron pedidos en la base de datos con los filtros aplicados.
            </p>
          </div>
        )}
        
        {!loading && !error && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                    Método de pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id.slice(-8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.user_profiles?.email || 'Email no disponible'}
                        </div>
                        {(order.user_profiles?.first_name || order.user_profiles?.last_name) && (
                          <div className="text-sm text-gray-500">
                            {`${order.user_profiles?.first_name || ''} ${order.user_profiles?.last_name || ''}`.trim()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        Pedido #{order.id.slice(-8)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Ver detalles para productos
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
                      <span className={`text-xs font-semibold rounded-full px-2 py-1 ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getPaymentMethod(order.payment_method)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Estado: {getPaymentStatusLabel(order.payment_status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
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
