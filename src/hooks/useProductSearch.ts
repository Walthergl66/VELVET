'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

interface SearchResult extends Product {
  relevance_score?: number;
}

interface UseProductSearchReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: SearchResult[];
  isSearching: boolean;
  showResults: boolean;
  setShowResults: (show: boolean) => void;
  clearSearch: () => void;
  selectProduct: (productId: string) => void;
  error: string | null;
}

/**
 * Hook personalizado para gestionar la búsqueda de productos
 * Proporciona búsqueda en tiempo real con resultados relevantes
 */
export function useProductSearch(): UseProductSearchReturn {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función de búsqueda optimizada
  const searchProducts = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Búsqueda mejorada con múltiples campos y relevancia
      const { data, error: searchError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories!category_id(*)
        `)
        .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
        .eq('active', true)
        .order('name')
        .limit(10);

      if (searchError) {
        throw searchError;
      }

      // Calcular puntuación de relevancia simple
      const resultsWithRelevance = (data || []).map((product) => {
        let score = 0;
        const searchLower = term.toLowerCase();
        const nameLower = product.name.toLowerCase();
        const descLower = (product.description || '').toLowerCase();

        // Coincidencia exacta en nombre (mayor peso)
        if (nameLower.includes(searchLower)) {
          score += nameLower.startsWith(searchLower) ? 100 : 50;
        }

        // Coincidencia en descripción
        if (descLower.includes(searchLower)) {
          score += 20;
        }

        // Coincidencia en categoría
        if (product.category?.name?.toLowerCase().includes(searchLower)) {
          score += 30;
        }

        return {
          ...product,
          relevance_score: score,
        };
      });

      // Ordenar por relevancia
      const sortedResults = resultsWithRelevance
        .filter(product => (product.relevance_score || 0) > 0)
        .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));

      setSearchResults(sortedResults);
    } catch (err) {
      console.error('Error searching products:', err);
      setError('Error al buscar productos');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce de búsqueda para evitar llamadas excesivas
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchProducts]);

  // Mostrar/ocultar resultados basado en el término de búsqueda
  useEffect(() => {
    setShowResults(searchTerm.trim().length > 0);
  }, [searchTerm]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
    setError(null);
  }, []);

  const selectProduct = useCallback((_productId: string) => {
    // Esta función puede ser usada para navegación
    clearSearch();
  }, [clearSearch]);

  const handleSetSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResults([]);
      setShowResults(false);
    }
  }, []);

  return {
    searchTerm,
    setSearchTerm: handleSetSearchTerm,
    searchResults,
    isSearching,
    showResults,
    setShowResults,
    clearSearch,
    selectProduct,
    error,
  };
}
