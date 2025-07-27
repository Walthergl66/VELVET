'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Página del carrito de compras completo
 * Permite gestionar todos los productos del carrito antes del checkout
 */

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, getItemCount, loading } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Tu carrito está vacío
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Parece que no has agregado ningún producto a tu carrito todavía.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Carrito de Compras
            </h1>
            <p className="text-gray-600 mt-1">
              {getItemCount()} {getItemCount() === 1 ? 'producto' : 'productos'} en tu carrito
            </p>
          </div>
          <Link
            href="/shop"
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            ← Continuar Comprando
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Productos ({cart.items.length})
                </h2>
                {cart.items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                    disabled={loading}
                  >
                    Vaciar Carrito
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <div key={item.id} className="px-6 py-6">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={item.product.images?.[0] || '/images/placeholder.jpg'}
                          alt={item.product.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.product.id}`}
                          className="text-lg font-medium text-gray-900 hover:text-gray-700 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        
                        <div className="mt-1 text-sm text-gray-500">
                          <p>Talla: {item.size}</p>
                          <p>Color: {item.color}</p>
                          {item.product.category && (
                            <p className="capitalize">Categoría: {item.product.category.name}</p>
                          )}
                        </div>

                        {/* Price */}
                        <div className="mt-2 flex items-center space-x-2">
                          {item.product.discount_price ? (
                            <>
                              <span className="text-lg font-semibold text-red-600">
                                {formatPrice(item.product.discount_price)}
                              </span>
                              <span className="text-sm text-gray-400 line-through">
                                {formatPrice(item.product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-semibold text-gray-900">
                              {formatPrice(item.product.price)}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">c/u</span>
                        </div>

                        {/* Quantity and Actions */}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-700">
                              Cantidad:
                            </span>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                disabled={loading || item.quantity <= 1}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                disabled={loading}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                            disabled={loading}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="mt-2">
                          <span className="text-lg font-semibold text-gray-900">
                            Subtotal: {formatPrice((item.product.discount_price || item.product.price) * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm sticky top-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Resumen del Pedido
                </h2>
              </div>

              <div className="px-6 py-4 space-y-4">
                {/* Summary Details */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Subtotal ({getItemCount()} productos):
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(cart.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío:</span>
                    <span className="font-medium text-gray-900">
                      {cart.shipping === 0 ? (
                        <span className="text-green-600">Gratis</span>
                      ) : (
                        formatPrice(cart.shipping)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IVA (16%):</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(cart.tax)}
                    </span>
                  </div>

                  {cart.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Descuento:</span>
                      <span className="font-medium text-red-600">
                        -{formatPrice(cart.discount)}
                      </span>
                    </div>
                  )}
                </div>

                <hr className="border-gray-200" />

                {/* Total */}
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    Total:
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(cart.total)}
                  </span>
                </div>

                {/* Shipping Info */}
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <p>
                    {cart.shipping === 0 
                      ? '🎉 ¡Felicidades! Tu pedido califica para envío gratis.'
                      : `Agrega ${formatPrice(1000 - cart.subtotal)} más para obtener envío gratis.`
                    }
                  </p>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="block w-full bg-black text-white text-center py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Proceder al Checkout
                </Link>

                {/* Continue Shopping */}
                <Link
                  href="/shop"
                  className="block w-full text-center py-3 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  Continuar Comprando
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
              <span className="text-gray-900 font-medium">Actualizando carrito...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
