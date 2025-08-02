'use client';

import React from 'react';
import { useRole } from '@/hooks/useRole';
import Link from 'next/link';

/**
 * Componente para mostrar información del rol del usuario
 * y enlaces relevantes según sus permisos
 */

export default function UserRoleInfo() {
  const { role, isAdmin, isSuperAdmin, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const getRoleDisplay = () => {
    switch (role) {
      case 'super_admin':
        return {
          name: 'Super Administrador',
          color: 'bg-red-100 text-red-800',
          icon: '👑',
          description: 'Acceso completo al sistema'
        };
      case 'admin':
        return {
          name: 'Administrador',
          color: 'bg-blue-100 text-blue-800',
          icon: '🔧',
          description: 'Acceso al panel de administración'
        };
      case 'user':
      default:
        return {
          name: 'Usuario',
          color: 'bg-green-100 text-green-800',
          icon: '👤',
          description: 'Usuario estándar'
        };
    }
  };

  const roleInfo = getRoleDisplay();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Tu Rol</h3>
        <span className="text-2xl">{roleInfo.icon}</span>
      </div>
      
      <div className="flex items-center mb-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo.color}`}>
          {roleInfo.name}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        {roleInfo.description}
      </p>

      {isAdmin && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Accesos Administrativos
          </h4>
          <div className="space-y-2">
            <Link
              href="/admin"
              className="block text-sm text-blue-600 hover:text-blue-700"
            >
              🏢 Panel de Administración
            </Link>
            <Link
              href="/admin/products"
              className="block text-sm text-blue-600 hover:text-blue-700"
            >
              👕 Gestión de Productos
            </Link>
            <Link
              href="/admin/orders"
              className="block text-sm text-blue-600 hover:text-blue-700"
            >
              📦 Gestión de Pedidos
            </Link>
            {isSuperAdmin && (
              <Link
                href="/admin/users"
                className="block text-sm text-blue-600 hover:text-blue-700"
              >
                👥 Gestión de Usuarios
              </Link>
            )}
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="border-t pt-4">
          <p className="text-xs text-gray-500">
            ¿Necesitas acceso administrativo? Contacta con el equipo de soporte.
          </p>
        </div>
      )}
    </div>
  );
}
