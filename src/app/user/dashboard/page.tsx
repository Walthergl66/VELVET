'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

/**
 * Dashboard principal del usuario autenticado
 * Muestra resumen de actividad y accesos rápidos
 */

export default function UserDashboard() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-2 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-7xl space-y-10">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center">
          <h1 className="text-4xl font-extrabold text-black select-none">Bienvenido, {user?.user_metadata?.first_name || user?.email}</h1>
          <p className="text-gray-600 mt-2 text-lg text-center">Gestiona tu cuenta y revisa tus pedidos desde aquí</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-10 w-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="ml-6">
              <h3 className="text-lg font-semibold text-gray-900">Pedidos Totales</h3>
              <p className="text-2xl font-bold text-blue-600">0</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-6">
              <h3 className="text-lg font-semibold text-gray-900">Total Gastado</h3>
              <p className="text-2xl font-bold text-green-600">$0.00</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="ml-6">
              <h3 className="text-lg font-semibold text-gray-900">Favoritos</h3>
              <p className="text-2xl font-bold text-red-600">0</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Account Management */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-black">Gestión de Cuenta</h2>
            </div>
            <div className="p-8 space-y-6">
              <Link
                href="/user/profile"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="h-6 w-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <h3 className="font-medium text-gray-900">Mi Perfil</h3>
                  <p className="text-sm text-gray-500">Actualiza tu información personal</p>
                </div>
              </Link>
              <Link
                href="/user/addresses"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="h-6 w-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h3 className="font-medium text-gray-900">Direcciones</h3>
                  <p className="text-sm text-gray-500">Gestiona tus direcciones de envío</p>
                </div>
              </Link>
              <Link
                href="/user/payment-methods"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="h-6 w-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <div>
                  <h3 className="font-medium text-gray-900">Métodos de Pago</h3>
                  <p className="text-sm text-gray-500">Administra tus tarjetas y métodos</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Order History */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-black">Historial de Pedidos</h2>
            </div>
            <div className="p-8">
              <div className="text-center py-8">
                <svg className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tienes pedidos aún
                </h3>
                <p className="text-gray-500 mb-4">
                  Explora nuestra tienda y realiza tu primera compra
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center bg-black text-white px-6 py-3 rounded-full font-semibold shadow hover:scale-105 transition-all duration-200"
                >
                  Explorar Tienda
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-black">Actividad Reciente</h2>
          </div>
          <div className="p-8">
            <div className="text-center py-8">
              <p className="text-gray-500">No hay actividad reciente para mostrar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
