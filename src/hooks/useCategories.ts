import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types';

/**
 * Hook para gestionar las categorías de productos
 * Maneja la carga de categorías desde Supabase
 */

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        const errorMessage = typeof error === 'string' ? error : error.message || 'Error al cargar categorías';
        throw new Error(errorMessage);
      }

      setCategories(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching categories:', err);
      
      // Fallback con categorías de ejemplo para desarrollo
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

  const refetch = () => {
    fetchCategories();
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
