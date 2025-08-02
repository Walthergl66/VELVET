'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types';

/**
 * Hook para gestionar las categorías de productos desde Supabase
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refetch();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw new Error(error.message);

      setCategories(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      console.error('Error fetching categories:', err);

      // Fallback local en desarrollo
      setCategories([
        {
          id: '1',
          name: 'Hombre',
          slug: 'hombre',
          description: 'Ropa para hombre',
          image_url: null,
          parent_id: null,
          product_count: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Mujer',
          slug: 'mujer',
          description: 'Ropa para mujer',
          image_url: null,
          parent_id: null,
          product_count: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Accesorios',
          slug: 'accesorios',
          description: 'Accesorios y complementos',
          image_url: null,
          parent_id: null,
          product_count: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  const getCategoryBySlug = (slug: string) => {
    return categories.find(category => category.slug === slug);
  };

  return {
    categories,
    loading,
    error,
    getCategoryById,
    getCategoryBySlug,
    refetch
  };
}
