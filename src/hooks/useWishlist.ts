'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Product } from '@/types';

interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product: Product;
  created_at: string;
}

interface UseWishlistReturn {
  wishlistItems: WishlistItem[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  fetchWishlist: () => Promise<void>;
}

export function useWishlist(): UseWishlistReturn {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener la wishlist
  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          user_id,
          product_id,
          created_at,
          products (
            id,
            name,
            description,
            price,
            discount_price,
            images,
            brand,
            active
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transformar datos para incluir el producto
      const transformedItems: WishlistItem[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        product_id: item.product_id,
        created_at: item.created_at,
        product: Array.isArray(item.products) ? item.products[0] as Product : item.products as Product
      }));

      setWishlistItems(transformedItems);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar la lista de favoritos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Función para agregar producto a favoritos
  const addToWishlist = useCallback(async (productId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          product_id: productId
        });

      if (error) {
        throw error;
      }

      // Recargar la wishlist
      await fetchWishlist();
      return true;
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setError(err instanceof Error ? err.message : 'Error al agregar a favoritos');
      return false;
    }
  }, [user, fetchWishlist]);

  // Función para remover producto de favoritos
  const removeFromWishlist = useCallback(async (productId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        throw error;
      }

      // Actualizar estado local
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
      return true;
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError(err instanceof Error ? err.message : 'Error al remover de favoritos');
      return false;
    }
  }, [user]);

  // Función para verificar si un producto está en favoritos
  const isInWishlist = useCallback((productId: string): boolean => {
    return wishlistItems.some(item => item.product_id === productId);
  }, [wishlistItems]);

  // Cargar wishlist al montar el componente
  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [user, fetchWishlist]);

  return {
    wishlistItems,
    loading,
    error,
    totalItems: wishlistItems.length,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    fetchWishlist,
  };
}
