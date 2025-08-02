import { useState, useEffect } from 'react';
import { Product, Category, ProductFilters } from '@/types';
import { getProducts, getProductById, getCategories } from '@/lib/supabase';

/**
 * Hook personalizado para manejar datos de productos desde Supabase
 * Conecta directamente con la base de datos para operaciones CRUD
 */

export interface UseProductsParams extends ProductFilters {
  category?: string;
  subcategory?: string;
  featured?: boolean;
  search?: string;
  min_price?: number;
  max_price?: number;
  sizes?: string[];
  colors?: string[];
  brands?: string[];
  sort_by?: 'name' | 'price' | 'created_at' | 'featured';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export const useProducts = (params: UseProductsParams = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching products with params:', params);
        
        // Convertir parámetros de categoría slug a ID si es necesario
        let categoryId = params.category;
        let subcategoryId = params.subcategory;

        // Si category es un slug, buscar el ID correspondiente
        if (params.category && !params.category.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          const { data: categories } = await getCategories();
          const category = categories?.find(cat => cat.slug === params.category);
          categoryId = category?.id;
        }

        if (params.subcategory && !params.subcategory.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          const { data: categories } = await getCategories();
          const subcategory = categories?.find(cat => cat.slug === params.subcategory);
          subcategoryId = subcategory?.id;
        }

        const filters = {
          category_id: categoryId,
          subcategory_id: subcategoryId,
          featured: params.featured,
          search: params.search,
          min_price: params.min_price,
          max_price: params.max_price,
          sizes: params.sizes,
          colors: params.colors,
          sort_by: params.sort_by || 'created_at',
          sort_order: params.sort_order || 'desc',
          limit: params.limit,
          offset: params.offset,
        };

        const { data, error: fetchError, count } = await getProducts(filters);

        console.log('Products fetch result:', { data, error: fetchError, count });

        if (fetchError) {
          const errorMessage = typeof fetchError === 'string' ? fetchError : fetchError.message || 'Error desconocido';
          console.error('Fetch error:', errorMessage);
          throw new Error(errorMessage);
        }

        // Enriquecer productos con información de categorías si es necesario
        if (data && data.length > 0) {
          const { data: categoriesData } = await getCategories();
          const categoriesMap = new Map((categoriesData || []).map(cat => [cat.id, cat]));
          
          const enrichedProducts = data.map(product => ({
            ...product,
            category: product.category_id ? categoriesMap.get(product.category_id) : undefined,
            subcategory: product.subcategory_id ? categoriesMap.get(product.subcategory_id) : undefined
          }));
          
          setProducts(enrichedProducts);
        } else {
          setProducts(data || []);
        }
        
        setTotal(count || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los productos');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    params.category,
    params.subcategory,
    params.featured,
    params.search,
    params.min_price,
    params.max_price,
    params.sizes?.join(','),
    params.colors?.join(','),
    params.brands?.join(','),
    params.sort_by,
    params.sort_order,
    params.limit,
    params.offset,
  ]);

  return { products, loading, error, total };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await getProductById(id);

        if (fetchError) {
          const errorMessage = typeof fetchError === 'string' ? fetchError : fetchError.message || 'Error desconocido';
          throw new Error(errorMessage);
        }

        if (data) {
          // Cargar información de categoría si existe
          if (data.category_id) {
            const { data: categoriesData } = await getCategories();
            const category = categoriesData?.find(cat => cat.id === data.category_id);
            const subcategory = data.subcategory_id ? categoriesData?.find(cat => cat.id === data.subcategory_id) : undefined;
            
            setProduct({
              ...data,
              category,
              subcategory
            });
          } else {
            setProduct(data);
          }
        } else {
          setError('Producto no encontrado');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el producto');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
};

/**
 * Hook para buscar productos con debounce
 */
export const useProductSearch = (query: string, delay: number = 300) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  useEffect(() => {
    const searchProducts = async () => {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const { data } = await getProducts({
          search: debouncedQuery,
          limit: 8
        });

        setSuggestions(data || []);
      } catch (err) {
        console.error('Error searching products:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [debouncedQuery]);

  return { suggestions, loading };
};

/**
 * Hook para productos relacionados
 */
export const useRelatedProducts = (productId: string, limit: number = 4) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!productId) return;

      setLoading(true);
      try {
        // Primero obtener el producto actual para conocer su categoría
        const { data: currentProduct } = await getProductById(productId);
        
        if (currentProduct) {
          // Buscar productos de la misma categoría excluyendo el actual
          const { data } = await getProducts({
            category_id: currentProduct.category_id || undefined,
            limit: limit + 1 // +1 para excluir el producto actual
          });

          const filtered = (data || []).filter(product => product.id !== productId).slice(0, limit);
          setRelatedProducts(filtered);
        }
      } catch (err) {
        console.error('Error fetching related products:', err);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId, limit]);

  return { relatedProducts, loading };
};
