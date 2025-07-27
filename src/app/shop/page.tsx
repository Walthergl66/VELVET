'use client';

import React, { useState, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import ProductCard from '@/components/product/ProductCard';
import Link from 'next/link';

/**
 * Página de la tienda - Lista todos los productos con filtros y búsqueda
 * Incluye filtros por categoría, precio, talla y color
 */

type SortOption = 'default' | 'price-low' | 'price-high' | 'name' | 'newest';

export default function ShopPage() {
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showFilters, setShowFilters] = useState(false);

  // Opciones de filtros
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const availableColors = [
    { name: 'Negro', value: 'black', color: '#000000' },
    { name: 'Blanco', value: 'white', color: '#FFFFFF' },
    { name: 'Gris', value: 'gray', color: '#6B7280' },
    { name: 'Azul', value: 'blue', color: '#3B82F6' },
    { name: 'Rojo', value: 'red', color: '#EF4444' },
    { name: 'Verde', value: 'green', color: '#10B981' },
    { name: 'Rosa', value: 'pink', color: '#EC4899' },
    { name: 'Amarillo', value: 'yellow', color: '#F59E0B' },
  ];

  const sortOptions = [
    { value: 'default', label: 'Predeterminado' },
    { value: 'price-low', label: 'Precio: Menor a Mayor' },
    { value: 'price-high', label: 'Precio: Mayor a Menor' },
    { value: 'name', label: 'Nombre A-Z' },
    { value: 'newest', label: 'Más Recientes' },
  ];

  // Productos filtrados y ordenados
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products.filter(product => {
      // Filtro por búsqueda
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !product.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filtro por categoría
      if (selectedCategory && product.category_id !== selectedCategory) {
        return false;
      }

      // Filtro por precio
      const productPrice = product.discount_price || product.price;
      if (productPrice < priceRange.min || productPrice > priceRange.max) {
        return false;
      }

      // Filtro por tallas (si están disponibles)
      if (selectedSizes.length > 0 && product.sizes) {
        const productSizes = Array.isArray(product.sizes) ? product.sizes : [];
        if (!selectedSizes.some(size => productSizes.includes(size))) {
          return false;
        }
      }

      // Filtro por colores (si están disponibles)
      if (selectedColors.length > 0 && product.colors) {
        const productColors = Array.isArray(product.colors) ? product.colors : [];
        if (!selectedColors.some(color => productColors.includes(color))) {
          return false;
        }
      }

      return true;
    });

    // Ordenamiento
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      default:
        // Mantener orden predeterminado
        break;
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, selectedSizes, selectedColors, priceRange, sortBy]);

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange({ min: 0, max: 10000 });
    setSortBy('default');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  if (productsError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="text-red-500 text-lg mb-4">
              Error al cargar los productos: {productsError}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Tienda</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre nuestra colección completa de ropa moderna y elegante.
              Encuentra tu estilo perfecto entre nuestra amplia variedad de productos.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-2"
              >
                <span className="font-medium">Filtros</span>
                <svg 
                  className={`w-5 h-5 transform transition-transform ${showFilters ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Filters */}
            <div className={`bg-white rounded-lg shadow-sm p-6 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Productos
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categorías
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === ''}
                      onChange={() => setSelectedCategory('')}
                      className="text-black focus:ring-black"
                    />
                    <span className="ml-2 text-sm text-gray-700">Todas</span>
                  </label>
                  {!categoriesLoading && categories?.map(category => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category.id}
                        onChange={() => setSelectedCategory(category.id)}
                        className="text-black focus:ring-black"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rango de Precio
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                      placeholder="Mín"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                      placeholder="Máx"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                  </div>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tallas
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                        selectedSizes.includes(size)
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colores
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => handleColorToggle(color.value)}
                      title={color.name}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColors.includes(color.value)
                          ? 'border-black ring-2 ring-black ring-offset-2'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.color }}
                    >
                      {color.value === 'white' && (
                        <div className="w-full h-full rounded-full border border-gray-200" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full text-sm text-gray-600 hover:text-gray-900 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          {/* Products */}
          <div className="flex-1">
            {/* Sort and Results Count */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                {productsLoading ? (
                  'Cargando productos...'
                ) : (
                  `Mostrando ${filteredProducts.length} de ${products?.length || 0} productos`
                )}
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Ordenar por:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                    <div className="w-full h-64 bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-6 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.65-6.364-1.75L3 16.25v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.25l-2.636-3" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-600 mb-6">
                  Intenta ajustar tus filtros o buscar con términos diferentes.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
