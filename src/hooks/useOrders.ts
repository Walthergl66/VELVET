'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Order, OrderStatus } from '@/types';

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  totalOrders: number;
  hasMore: boolean;
  fetchOrders: (filters?: OrderFilters) => Promise<void>;
  getOrderById: (id: string) => Promise<Order | null>;
  retryFetch: () => void;
}

interface OrderFilters {
  status?: OrderStatus;
  limit?: number;
  offset?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useOrders(): UseOrdersReturn {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<OrderFilters>({});

  // Función para obtener pedidos con filtros
  const fetchOrders = useCallback(async (filters: OrderFilters = {}) => {
    if (!user) {
      console.log('useOrders: No user found, skipping fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('useOrders: Starting fetch for user:', user.id);
      console.log('useOrders: Filters:', filters);
      setLoading(true);
      setError(null);
      setCurrentFilters(filters);

      const { limit = 10, offset = 0, status, search, dateFrom, dateTo } = filters;

      // Consulta base
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items(
            id,
            product_id,
            product_snapshot,
            quantity,
            size,
            color,
            unit_price,
            total_price
          )
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (status) {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(`tracking_number.ilike.%${search}%,notes.ilike.%${search}%`);
      }

      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }

      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }

      // Paginación
      query = query.range(offset, offset + limit - 1);

      console.log('useOrders: Executing query...');
      const { data, error: fetchError, count } = await query;

      console.log('useOrders: Query result:', { data, error: fetchError, count });

      if (fetchError) {
        console.error('useOrders: Query error:', fetchError);
        throw fetchError;
      }

      // Transformar datos para incluir items
      const transformedOrders: Order[] = (data || []).map(order => ({
        ...order,
        items: order.order_items || [],
        // Parsear campos JSON si es necesario
        shipping_address: typeof order.shipping_address === 'string' 
          ? JSON.parse(order.shipping_address) 
          : order.shipping_address,
        billing_address: typeof order.billing_address === 'string' 
          ? JSON.parse(order.billing_address) 
          : order.billing_address,
        payment_method: typeof order.payment_method === 'string' 
          ? JSON.parse(order.payment_method) 
          : order.payment_method,
      }));

      console.log('useOrders: Transformed orders:', transformedOrders);

      if (offset === 0) {
        setOrders(transformedOrders);
      } else {
        setOrders(prev => [...prev, ...transformedOrders]);
      }

      setTotalOrders(count || 0);
      setHasMore(transformedOrders.length === limit);

      console.log('useOrders: Final state - orders count:', transformedOrders.length, 'total:', count);

    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Función para obtener un pedido específico por ID
  const getOrderById = useCallback(async (id: string): Promise<Order | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items(
            id,
            product_id,
            product_snapshot,
            quantity,
            size,
            color,
            unit_price,
            total_price
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (!data) return null;

      // Transformar datos
      return {
        ...data,
        items: data.order_items || [],
        shipping_address: typeof data.shipping_address === 'string' 
          ? JSON.parse(data.shipping_address) 
          : data.shipping_address,
        billing_address: typeof data.billing_address === 'string' 
          ? JSON.parse(data.billing_address) 
          : data.billing_address,
        payment_method: typeof data.payment_method === 'string' 
          ? JSON.parse(data.payment_method) 
          : data.payment_method,
      };

    } catch (err) {
      console.error('Error fetching order by ID:', err);
      return null;
    }
  }, [user]);

  // Función para reintentar la carga
  const retryFetch = useCallback(() => {
    fetchOrders(currentFilters);
  }, [fetchOrders, currentFilters]);

  // Cargar pedidos al montar el componente
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  return {
    orders,
    loading,
    error,
    totalOrders,
    hasMore,
    fetchOrders,
    getOrderById,
    retryFetch,
  };
}
