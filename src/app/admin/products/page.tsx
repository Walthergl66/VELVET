'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Product, Category } from '@/types';
import Image from 'next/image';

/**
 * Página de listado de productos para administradores
 * Incluye filtros, búsqueda y acciones de gestión
 */

interface ProductsPageState {
  products: Product[];
  categories: Category[];
  loading: boolean;
  searchTerm: string;
  selectedCategory: string;
  sortBy: string;
  currentPage: number;
  totalPages: number;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [state, setState] = useState<ProductsPageState>({
    products: [],
    categories: [],
    loading: true,
    searchTerm: '',
    selectedCategory: '',
    sortBy: 'created_at',
    currentPage: 1,
    totalPages: 1
  });

  const itemsPerPage = 12;

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [state.currentPage, state.searchTerm, state.selectedCategory, state.sortBy]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setState(prev => ({ ...prev, categories: data || [] }));
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `, { count: 'exact' });

      // Aplicar filtros
      if (state.searchTerm) {
        query = query.ilike('name', `%${state.searchTerm}%`);
      }

      if (state.selectedCategory) {
        query = query.eq('category_id', state.selectedCategory);
      }

      // Aplicar ordenamiento
      const ascending = state.sortBy === 'name';
      query = query.order(state.sortBy, { ascending });

      // Aplicar paginación
      const from = (state.currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / itemsPerPage);

      setState(prev => ({
        ...prev,
        products: data || [],
        totalPages,
        loading: false
      }));
    } catch (error) {
      console.error('Error loading products:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSearch = (searchTerm: string) => {
    setState(prev => ({
      ...prev,
      searchTerm,
      currentPage: 1
    }));
  };

  const handleCategoryFilter = (categoryId: string) => {
    setState(prev => ({
      ...prev,
      selectedCategory: categoryId,
      currentPage: 1
    }));
  };

  const handleSort = (sortBy: string) => {
    setState(prev => ({ ...prev, sortBy, currentPage: 1 }));
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      // Actualizar el estado local
      setState(prev => ({
        ...prev,
        products: prev.products.map(product =>
          product.id === productId
            ? { ...product, active: !currentStatus }
            : product
        )
      }));
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Error al actualizar el estado del producto');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      // Recargar productos
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
            Gestión de Productos
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra el catálogo de productos de VELVET
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
          >
            + Nuevo Producto
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
        {/* Búsqueda */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={state.searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        {/* Filtro por categoría */}
        <div className="md:w-48">
          <select
            value={state.selectedCategory}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            {state.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ordenamiento */}
        <div className="md:w-48">
          <select
            value={state.sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="created_at">Más recientes</option>
            <option value="name">Nombre A-Z</option>
            <option value="price">Precio menor</option>
            <option value="stock">Stock</option>
          </select>
        </div>
      </div>

      {/* Lista de productos */}
      {state.loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <div className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : state.products.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-500">
            Intenta ajustar los filtros o crea un nuevo producto.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {state.products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Imagen del producto */}
              <div className="image-container-fill relative aspect-square bg-gray-100 overflow-hidden" style={{ position: 'relative' }}>
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <span className="text-4xl">📷</span>
                  </div>
                )}
                
                {/* Badge de estado */}
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Badge de stock bajo */}
                {product.stock < 10 && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Stock bajo
                    </span>
                  </div>
                )}
              </div>

              {/* Información del producto */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                  {product.name}
                </h3>
                
                <p className="text-sm text-gray-500 mb-2">
                  {product.category?.name || 'Sin categoría'}
                </p>

                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(product.discount_price || product.price)}
                    </span>
                    {product.discount_price && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    Stock: {product.stock}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mb-4">
                  Creado: {formatDate(product.created_at)}
                </p>

                {/* Acciones */}
                <div className="flex space-x-2">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-3 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => toggleProductStatus(product.id, product.active)}
                    className={`flex-1 text-center py-2 px-3 rounded text-sm font-medium transition-colors ${
                      product.active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {product.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="bg-red-100 text-red-700 py-2 px-3 rounded text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {state.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Página {state.currentPage} de {state.totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              disabled={state.currentPage === 1}
              className="bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              disabled={state.currentPage === state.totalPages}
              className="bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
