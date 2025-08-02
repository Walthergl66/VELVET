'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

/**
 * Tarjeta de producto para mostrar información básica y acciones principales
 * Integrada con Supabase para gestión de datos y carrito
 */

interface ProductCardProps {
  readonly product: Product;
  readonly className?: string;
  readonly priority?: boolean; // Para imágenes above the fold
}

export default function ProductCard({ product, className = '', priority = false }: ProductCardProps) {
  const { addToCart, isInCart, loading } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  // Función auxiliar para obtener opciones de talla del producto
  const getSizeOptions = () => {
    const sizeOption = product.options?.find(option => 
      option.title?.toLowerCase().includes('talla') || 
      option.title?.toLowerCase().includes('size')
    );
    return sizeOption?.values?.map(value => value.value) || [];
  };

  // Función auxiliar para obtener opciones de color del producto
  const getColorOptions = () => {
    const colorOption = product.options?.find(option => 
      option.title?.toLowerCase().includes('color') || 
      option.title?.toLowerCase().includes('colour')
    );
    return colorOption?.values?.map(value => value.value) || [];
  };

  // Función para verificar si todas las opciones requeridas están seleccionadas
  const hasRequiredOptions = () => {
    if (!product.options || product.options.length === 0) return true;
    return product.options.every(option => selectedOptions[option.id]);
  };

  const handleQuickAdd = async () => {
    if (!hasRequiredOptions()) {
      setShowQuickAdd(true);
      return;
    }

    try {
      // Obtener opciones de tamaño y color desde las opciones del producto
      const sizeOption = product.options?.find(opt => opt.title.toLowerCase().includes('talla') || opt.title.toLowerCase().includes('size'));
      const colorOption = product.options?.find(opt => opt.title.toLowerCase().includes('color'));
      
      const selectedSize = sizeOption ? sizeOption.values?.find(val => val.id === selectedOptions[sizeOption.id])?.value || '' : '';
      const selectedColor = colorOption ? colorOption.values?.find(val => val.id === selectedOptions[colorOption.id])?.value || '' : '';

      // Buscar variante correspondiente si existe
      const selectedVariant = product.variants?.find(variant => variant.active && variant.stock > 0);
      
      await addToCart(product, selectedSize, selectedColor, 1, selectedVariant?.id);
      setShowQuickAdd(false);
      setSelectedOptions({});
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Agregando...';
    if (isProductInCart) return 'En Carrito';
    return 'Agregar al Carrito';
  };

  const isProductInCart = (() => {
    if (!hasRequiredOptions()) return false;
    
    const sizeOption = product.options?.find(opt => opt.title.toLowerCase().includes('talla') || opt.title.toLowerCase().includes('size'));
    const colorOption = product.options?.find(opt => opt.title.toLowerCase().includes('color'));
    
    const selectedSize = sizeOption ? sizeOption.values?.find(val => val.id === selectedOptions[sizeOption.id])?.value || '' : '';
    const selectedColor = colorOption ? colorOption.values?.find(val => val.id === selectedOptions[colorOption.id])?.value || '' : '';
    
    return isInCart(product.id, selectedSize, selectedColor);
  })();

  const discountPercentage = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    <article 
      className={`group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowQuickAdd(false);
      }}
      onFocus={() => setIsHovered(true)}
      onBlur={() => {
        setIsHovered(false);
        setShowQuickAdd(false);
      }}
    >
      {/* Product Image */}
      <div 
        className="image-container-fill relative aspect-square overflow-hidden rounded-t-lg bg-gray-100" 
        style={{ position: 'relative', zIndex: 0 }}
      >
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <Image
            src={product.images?.[0] || '/images/placeholder-product.jpg'}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.featured && (
            <span className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Destacado
            </span>
          )}
          {product.discount_price && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
              -{discountPercentage}%
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
              ¡Solo {product.stock}!
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Agotado
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className={`absolute top-2 right-2 flex flex-col gap-1 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <Link 
            href={`/product/${product.id}`}
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Link>
        </div>

        {/* Quick Add Panel */}
        {showQuickAdd && product.stock > 0 && (
          <div className="absolute inset-x-2 bottom-2 bg-white p-3 rounded-lg shadow-lg">
            <div className="space-y-2">
              {/* Product Options */}
              {product.options && product.options.map((option) => (
                <fieldset key={option.id}>
                  <legend className="text-xs font-medium text-gray-700 block mb-1">
                    {option.title}:
                  </legend>
                  <div className="flex gap-1 flex-wrap">
                    {option.values?.map((value) => (
                      <label
                        key={value.id}
                        className={`px-2 py-1 text-xs border rounded cursor-pointer ${
                          selectedOptions[option.id] === value.id
                            ? 'bg-black text-white border-black'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`option-${option.id}-${product.id}`}
                          value={value.id}
                          checked={selectedOptions[option.id] === value.id}
                          onChange={() => setSelectedOptions(prev => ({
                            ...prev,
                            [option.id]: value.id
                          }))}
                          className="sr-only"
                        />
                        {value.value}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}

              <button
                onClick={handleQuickAdd}
                disabled={loading || !hasRequiredOptions() || isProductInCart}
                className="w-full bg-black text-white text-xs font-medium py-2 rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {getButtonText()}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium text-gray-900 hover:text-gray-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {product.category && (
          <p className="text-sm text-gray-500 mt-1 capitalize">
            {product.category.name}
          </p>
        )}

        {/* Product Details */}
        {(product.material || product.weight || product.dimensions) && (
          <div className="text-xs text-gray-500 mt-1 space-y-1">
            {product.material && (
              <p>Material: {product.material}</p>
            )}
            {product.weight && (
              <p>Peso: {product.weight}kg</p>
            )}
            {product.dimensions && (
              <p>Dimensiones: {
                typeof product.dimensions === 'object' 
                  ? `${product.dimensions.length || 0} x ${product.dimensions.width || 0} x ${product.dimensions.height || 0} cm`
                  : product.dimensions
              }</p>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          {product.discount_price ? (
            <>
              <span className="text-lg font-semibold text-red-600">
                {formatPrice(product.discount_price)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-semibold text-gray-900">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => (
              <svg
                key={`star-${product.id}-${i}`}
                className={`w-4 h-4 ${
                  i < Math.floor(4.5) // Rating por defecto para mockup
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-500">
            (25)
          </span>
        </div>

        {/* Quick Add Button */}
        {!showQuickAdd && (
          <button
            onClick={() => product.stock > 0 ? setShowQuickAdd(true) : undefined}
            disabled={product.stock === 0 || loading}
            className={`w-full mt-3 py-2 rounded-lg font-medium transition-all duration-200 ${
              product.stock === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isProductInCart
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            } ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293a1 1 0 000 1.414L7 19m5-6v6a1 1 0 001 1h4a1 1 0 001-1v-6m-5-6v-2a4 4 0 118 0v2m-8 0V7a4 4 0 118 0v2m-8 0h8" />
            </svg>
            {product.stock === 0 ? 'Agotado' : getButtonText()}
          </button>
        )}
      </div>
    </article>
  );
}
