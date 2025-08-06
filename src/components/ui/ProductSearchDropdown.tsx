'use client';

import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProductSearch } from '@/hooks/useProductSearch';
import Image from 'next/image';

interface ProductSearchDropdownProps {
  placeholder?: string;
  className?: string;
  onResultClick?: () => void;
}

/**
 * Componente de búsqueda con dropdown de resultados
 * Muestra sugerencias de productos en tiempo real y permite navegación
 */
export default function ProductSearchDropdown({
  placeholder = "Buscar productos...",
  className = "",
  onResultClick
}: ProductSearchDropdownProps) {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    showResults,
    setShowResults,
    clearSearch,
    error
  } = useProductSearch();

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowResults]);

  const handleResultClick = (productId: string) => {
    router.push(`/product/${productId}`);
    clearSearch();
    onResultClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResults(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Enter' && searchResults.length > 0) {
      handleResultClick(searchResults[0].id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Input de búsqueda */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowResults(searchTerm.trim().length > 0)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Buscar productos"
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black"
        />
        {/* Loading indicator */}
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-black rounded-full"></div>
          </div>
        )}
        {/* Clear button */}
        {searchTerm && !isSearching && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {error && (
            <div className="p-4 text-red-600 text-sm">
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          {!error && searchResults.length === 0 && !isSearching && searchTerm.trim() && (
            <div className="p-4 text-gray-500 text-sm text-center">
              <svg className="h-8 w-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              No se encontraron productos para &ldquo;{searchTerm}&rdquo;
            </div>
          )}

          {searchResults.map((product) => (
            <button
              key={product.id}
              onClick={() => handleResultClick(product.id)}
              className="w-full p-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {/* Imagen del producto */}
                <div className="flex-shrink-0">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Información del producto */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm font-semibold text-black ml-2">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  {product.category && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {product.category.name}
                    </p>
                  )}
                  {product.description && (
                    <p className="text-xs text-gray-400 truncate mt-1">
                      {product.description.slice(0, 60)}...
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
