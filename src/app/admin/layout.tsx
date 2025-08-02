'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/hooks/useAuth';

/**
 * Layout del panel de administración
 * Incluye sidebar de navegación y área de contenido principal
 * Requiere autenticación y permisos de administrador
 */

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Productos', href: '/admin/products', icon: '👕' },
  { name: 'Categorías', href: '/admin/categories', icon: '📁' },
  { name: 'Pedidos', href: '/admin/orders', icon: '📦' },
  { name: 'Usuarios', href: '/admin/users', icon: '👥' },
  { name: 'Configuración', href: '/admin/settings', icon: '⚙️' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { isAdmin, isLoading, role } = useRole();

  // Mostrar loading mientras verificamos permisos
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Redirigir si no está autenticado
  if (!user) {
    router.push('/auth/login?redirectTo=/admin');
    return null;
  }

  // Mostrar mensaje de acceso denegado si no es admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-4 text-6xl">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder al panel de administración.
          </p>
          <div className="space-y-3">
            <Link
              href="/user/dashboard"
              className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Ir a Mi Dashboard
            </Link>
            <Link
              href="/"
              className="block w-full bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Volver a la Tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin" className="text-2xl font-bold text-gray-900">
                VELVET Admin
              </Link>
              {role === 'super_admin' && (
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Super Admin
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.email}
              </span>
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Ver Tienda
              </Link>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Cerrar Sesión
              </button>
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
          <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/admin' && pathname.startsWith(item.href));
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="md:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <nav className="flex justify-around">
          {navigation.slice(0, 4).map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-2 px-1 text-xs ${
                  isActive ? 'text-gray-900' : 'text-gray-600'
                }`}
              >
                <span className="text-lg mb-1">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
