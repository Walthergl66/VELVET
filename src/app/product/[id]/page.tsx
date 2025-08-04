'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { Product, ProductVariant, ProductOption, ProductOptionValue } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Página de detalle de producto
 * Muestra información completa del producto con galería de imágenes,
 * opciones de talla y color, y funcionalidad de agregar al carrito
 */

export default function ProductPage() {
  const params = useParams();
  const { addToCart, loading: cartLoading } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Cargar producto base
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          categories!products_category_id_fkey (
            id,
            name,
            slug
          )
        `)
        .eq('id', productId)
        .eq('active', true)
        .single();

      if (productError) {
        throw new Error(productError.message);
      }

      if (!productData) {
        throw new Error('Producto no encontrado');
      }

      // Cargar variantes
      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .eq('active', true);

      // Cargar opciones con sus valores
      const { data: optionsData, error: optionsError } = await supabase
        .from('product_options')
        .select(`
          *,
          product_option_values (
            id,
            value
          )
        `)
        .eq('product_id', productId);

      if (variantsError || optionsError) {
        throw new Error('Error cargando opciones del producto');
      }

      // Combinar datos
      const product: Product = {
        ...productData,
        category: productData.categories, // Corregir el nombre del campo
        variants: variantsData || [],
        options: optionsData?.map(option => ({
          ...option,
          values: option.product_option_values || []
        })) || []
      };

      setProduct(product);
      
      // Auto-seleccionar primera variante si existe
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      }

      // Auto-seleccionar primeros valores de opciones
      if (product.options && product.options.length > 0) {
        const initialOptions: Record<string, string> = {};
        product.options.forEach(option => {
          if (option.values && option.values.length > 0) {
            initialOptions[option.id] = option.values[0].id;
          }
        });
        setSelectedOptions(initialOptions);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Verificar que se hayan seleccionado todas las opciones requeridas
    if (product.options && product.options.length > 0) {
      const missingOptions = product.options.filter(option => !selectedOptions[option.id]);
      if (missingOptions.length > 0) {
        alert(`Por favor selecciona: ${missingOptions.map(opt => opt.title).join(', ')}`);
        return;
      }
    }

    // Verificar stock de la variante seleccionada o del producto base
    const availableStock = selectedVariant ? selectedVariant.stock : product.stock;
    if (availableStock === 0) {
      alert('Producto agotado');
      return;
    }

    try {
      // Obtener el tamaño y color desde las opciones seleccionadas
      const sizeOption = product.options?.find(opt => opt.title.toLowerCase().includes('talla') || opt.title.toLowerCase().includes('size'));
      const colorOption = product.options?.find(opt => opt.title.toLowerCase().includes('color'));
      
      const selectedSize = sizeOption ? sizeOption.values?.find(val => val.id === selectedOptions[sizeOption.id])?.value || '' : '';
      const selectedColor = colorOption ? colorOption.values?.find(val => val.id === selectedOptions[colorOption.id])?.value || '' : '';

      await addToCart(
        product,
        selectedSize,
        selectedColor,
        quantity,
        selectedVariant?.id
      );
      
      alert('Producto agregado al carrito');
    } catch (err) {
      alert('Error al agregar al carrito');
      console.error('Error adding to cart:', err);
    }
  };

  const handleOptionChange = (optionId: string, valueId: string) => {
    const newOptions = { ...selectedOptions, [optionId]: valueId };
    setSelectedOptions(newOptions);
    
    // Buscar variante que coincida con las opciones seleccionadas
    if (product?.variants && product.variants.length > 0) {
      // Aquí se podría implementar lógica más compleja para encontrar la variante correcta
      // Por ahora, usamos la primera variante disponible
      const availableVariant = product.variants.find(variant => variant.active && variant.stock > 0);
      if (availableVariant) {
        setSelectedVariant(availableVariant);
      }
    }
  };

  const getCurrentPrice = () => {
    if (selectedVariant) {
      return selectedVariant.price;
    }
    return product?.discount_price || product?.price || 0;
  };

  const getAvailableStock = () => {
    if (selectedVariant) {
      return selectedVariant.stock;
    }
    return product?.stock || 0;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  const getAddToCartButtonText = () => {
    if (cartLoading) return 'Agregando...';
    if (getAvailableStock() === 0) return 'Agotado';
    return 'Agregar al Carrito';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery Skeleton */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }, (_, i) => ({ id: `skeleton-thumb-${i}`, index: i })).map(({ id }) => (
                  <div key={id} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
            
            {/* Product Info Skeleton */}
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="space-y-2">
                {Array.from({ length: 4 }, (_, i) => ({ id: `skeleton-line-${i}`, index: i })).map(({ id }) => (
                  <div key={id} className="h-4 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {error || 'Producto no encontrado'}
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              El producto que buscas no existe o no está disponible.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Volver a la Tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = getCurrentPrice();
  const originalPrice = product.discount_price ? product.price : null;
  const hasDiscount = originalPrice && currentPrice < originalPrice;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-900">Inicio</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-gray-900">Tienda</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link 
                href={`/shop?category=${product.category.slug}`}
                className="hover:text-gray-900"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={product.images?.[selectedImage] || '/images/placeholder.jpg'}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={`thumbnail-${image}-${index}`}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-black' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              {product.brand && (
                <p className="text-lg text-gray-600">{product.brand}</p>
              )}
              
              {/* Price */}
              <div className="flex items-center space-x-3 mt-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(currentPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(originalPrice!)}
                  </span>
                )}
                {hasDiscount && (
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                    -{Math.round(((originalPrice! - currentPrice) / originalPrice!) * 100)}%
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Opciones del Producto */}
            {product.options && product.options.map((option) => (
              <div key={option.id}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {option.title}: {' '}
                  <span className="font-normal text-gray-600">
                    {option.values?.find(val => val.id === selectedOptions[option.id])?.value || 'Seleccionar'}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {option.values?.map((value) => (
                    <button
                      key={value.id}
                      onClick={() => handleOptionChange(option.id, value.id)}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        selectedOptions[option.id] === value.id
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {value.value}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cantidad</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-16 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(getAvailableStock(), quantity + 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                  disabled={quantity >= getAvailableStock()}
                >
                  +
                </button>
                <span className="text-sm text-gray-500 ml-4">
                  {getAvailableStock()} disponibles
                </span>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={cartLoading || getAvailableStock() === 0}
                className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {getAddToCartButtonText()}
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  ♡ Favoritos
                </button>
                <button className="border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Compartir
                </button>
              </div>
            </div>

            {/* Product Details */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              {product.material && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Material:</span>
                  <span className="font-medium">{product.material}</span>
                </div>
              )}
              {(product.sku || selectedVariant?.sku) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">SKU:</span>
                  <span className="font-medium">{selectedVariant?.sku || product.sku}</span>
                </div>
              )}
              {selectedVariant?.weight && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Peso:</span>
                  <span className="font-medium">{selectedVariant.weight}g</span>
                </div>
              )}
              {product.care_instructions && (
                <div>
                  <span className="text-gray-600">Cuidados:</span>
                  <p className="text-sm text-gray-600 mt-1">{product.care_instructions}</p>
                </div>
              )}
              {selectedVariant && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Variante:</span>
                  <span className="font-medium">
                    {Object.values(selectedOptions).length > 0 ? 'Personalizada' : 'Estándar'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Size Guide Modal */}
        {showSizeGuide && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Guía de Tallas</h2>
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-center py-8 text-gray-500">
                <p>Guía de tallas no disponible por el momento.</p>
                <p className="text-sm mt-2">Contacta con atención al cliente para más información.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
