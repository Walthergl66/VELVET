'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import CartDrawer from '../cart/CartDrawer';
import ProductSearchDropdown from '@/components/ui/ProductSearchDropdown';

interface HeaderProps {
  className?: string;
}

export default function Header({
  className = ''
}: HeaderProps) {
  const { getItemCount } = useCart();
  const { user, isAuthenticated, signOut } = useAuth();
  const { role, isAdmin, isLoading } = useRole();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isUser = role === 'user';

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  const getCartAriaLabel = () => {
    const itemCount = getItemCount();
    return itemCount > 0 
      ? `Carrito de compras (${itemCount} artículos)`
      : 'Carrito de compras (vacío)';
  };

  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Tienda', href: '/shop' },
  ];

  // Botón dinámico del panel solo para usuarios autenticados
  const panelButton = isAuthenticated ? {
    name: isAdmin ? 'Panel Admin' : 'Mi Panel',
    href: isAdmin ? '/admin' : '/user/dashboard'
  } : null;

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center justify-start min-w-0">
              <Link href="/" className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#ff3b4a] via-[#B32134] to-[#490000] bg-clip-text text-transparent">
                VELVET
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-6 xl:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-900 hover:text-gray-600 transition-colors font-medium text-sm xl:text-base"
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Botón dinámico del panel */}
              {panelButton && (
                <Link
                  href={panelButton.href}
                  className="text-gray-900 hover:text-gray-600 transition-colors font-medium text-sm xl:text-base"
                >
                  {panelButton.name}
                </Link>
              )}

              {/* Historial para usuarios autenticados que no son admin */}
              {isAuthenticated && isUser && (
                <Link
                  href="/user/orders"
                  className="text-gray-900 hover:text-gray-600 transition-colors font-medium text-sm xl:text-base"
                >
                  Historial
                </Link>
              )}
            </nav>

            {/* Search Bar - Hidden on small screens, visible on large */}
            <div className="hidden xl:flex flex-1 max-w-md 2xl:max-w-2xl mx-4 2xl:mx-8">
              <ProductSearchDropdown 
                placeholder="Buscar productos..." 
                className="w-full"
              />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors btn-touch"
                  aria-label="Menú de usuario"
                  aria-expanded={isUserMenuOpen ? "true" : "false"}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {isAuthenticated ? (
                      <div className="py-1">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user?.user_metadata?.first_name || user?.email}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          {!isLoading && role && (
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                isAdmin 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {isAdmin ? 'Admin' : 'Usuario'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Opciones para user */}
                        {isUser && (
                          <>
                            <Link
                              href="/user/profile"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Mi Perfil
                            </Link>
                            <Link
                              href="/user/addresses"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Mis Direcciones
                            </Link>
                            <Link
                              href="/user/orders"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Historial de Pedidos
                            </Link>
                          </>
                        )}

                        {/* Opciones para admin */}
                        {isAdmin && (
                          <>
                            <Link
                              href="/admin/products"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Gestión de Productos
                            </Link>
                            <Link
                              href="/admin/orders"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Gestión de Órdenes
                            </Link>
                            <Link
                              href="/admin/users"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Gestión de Usuarios
                            </Link>
                          </>
                        )}

                        <div className="border-t border-gray-100">
                          <button
                            onClick={handleSignOut}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-1">
                        <Link
                          href="/auth/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Iniciar Sesión
                        </Link>
                        <Link
                          href="/auth/register"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Crear Cuenta
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors btn-touch"
                aria-label={getCartAriaLabel()}
              >
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.993z" />
                </svg>
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium">
                    {getItemCount()}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors btn-touch"
                aria-label="Menú de navegación móvil"
                aria-expanded={isMobileMenuOpen ? "true" : "false"}
              >
                {isMobileMenuOpen ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="xl:hidden border-t border-gray-200 p-3 safe-area-padding">
            <ProductSearchDropdown 
              placeholder="Buscar productos..." 
              className="w-full"
            />
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1 safe-area-padding">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-3 text-base font-medium text-gray-900 hover:text-gray-600 hover:bg-gray-50 rounded-md"
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Botón dinámico del panel en móvil */}
                {panelButton && (
                  <Link
                    href={panelButton.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-3 text-base font-medium text-gray-900 hover:text-gray-600 hover:bg-gray-50 rounded-md"
                  >
                    {panelButton.name}
                  </Link>
                )}

                {/* Historial para usuarios en móvil */}
                {isAuthenticated && isUser && (
                  <Link
                    href="/user/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-3 text-base font-medium text-gray-900 hover:text-gray-600 hover:bg-gray-50 rounded-md"
                  >
                    Historial
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Click outside to close user menu */}
        {isUserMenuOpen && (
          <div
            className="fixed inset-0 z-10 bg-transparent cursor-default"
            aria-hidden="true"
            onClick={() => setIsUserMenuOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsUserMenuOpen(false);
              }
            }}
          />
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
