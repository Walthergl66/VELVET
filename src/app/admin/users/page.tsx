'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRole } from '@/hooks/useRole';
import { User } from '@/types';

/**
 * Página de gestión de usuarios para administradores
 * Permite ver, filtrar y modificar roles de usuarios
 */

interface UsersPageState {
  users: User[];
  loading: boolean;
  searchTerm: string;
  selectedRole: string;
  sortBy: string;
  currentPage: number;
  totalPages: number;
  totalUsers: number;
}

interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  newUsersThisMonth: number;
}

export default function AdminUsersPage() {
  const { role: currentUserRole, isAdmin } = useRole();
  const [state, setState] = useState<UsersPageState>({
    users: [],
    loading: true,
    searchTerm: '',
    selectedRole: 'all',
    sortBy: 'created_at',
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0
  });

  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    totalAdmins: 0,
    newUsersThisMonth: 0
  });

  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [state.currentPage, state.searchTerm, state.selectedRole, state.sortBy]);

  const loadStats = async () => {
    try {
      // Estadísticas generales
      const { data: allUsers, error } = await supabase
        .from('user_profiles')
        .select('role, created_at');

      if (error) throw error;

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats = {
        totalUsers: allUsers?.length || 0,
        totalAdmins: allUsers?.filter(u => u.role === 'admin').length || 0,
        newUsersThisMonth: allUsers?.filter(u => 
          new Date(u.created_at) >= firstDayOfMonth
        ).length || 0
      };

      setStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      let query = supabase
        .from('user_profiles')
        .select('*', { count: 'exact' });

      // Aplicar filtros
      if (state.searchTerm) {
        query = query.or(`first_name.ilike.%${state.searchTerm}%,last_name.ilike.%${state.searchTerm}%,email.ilike.%${state.searchTerm}%`);
      }

      if (state.selectedRole !== 'all') {
        query = query.eq('role', state.selectedRole);
      }

      // Ordenamiento
      const isAsc = !state.sortBy.startsWith('-');
      const sortField = state.sortBy.replace('-', '');
      query = query.order(sortField, { ascending: isAsc });

      // Paginación
      const from = (state.currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / itemsPerPage);

      setState(prev => ({
        ...prev,
        users: data || [],
        loading: false,
        totalPages,
        totalUsers: count || 0
      }));

    } catch (error) {
      console.error('Error loading users:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    // Solo admins pueden cambiar roles
    if (!isAdmin) {
      alert('Solo los administradores pueden cambiar roles de usuario.');
      return;
    }

    if (!confirm(`¿Estás seguro de que quieres cambiar el rol de este usuario a "${newRole}"?`)) {
      return;
    }

    setIsUpdatingRole(userId);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      // Recargar usuarios y estadísticas
      await loadUsers();
      await loadStats();

      alert('Rol actualizado correctamente');

    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error al actualizar el rol del usuario');
    } finally {
      setIsUpdatingRole(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'user':
        return 'Usuario';
      default:
        return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra usuarios y sus roles en el sistema</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-bold">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-bold">🔧</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Administradores</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAdmins}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-bold">📈</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nuevos este mes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.newUsersThisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar usuarios
            </label>
            <input
              type="text"
              id="search"
              placeholder="Nombre, email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={state.searchTerm}
              onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value, currentPage: 1 }))}
            />
          </div>

          {/* Filtro por rol */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por rol
            </label>
            <select
              id="role"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={state.selectedRole}
              onChange={(e) => setState(prev => ({ ...prev, selectedRole: e.target.value, currentPage: 1 }))}
            >
              <option value="all">Todos los roles</option>
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {/* Ordenamiento */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por
            </label>
            <select
              id="sort"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={state.sortBy}
              onChange={(e) => setState(prev => ({ ...prev, sortBy: e.target.value, currentPage: 1 }))}
            >
              <option value="created_at">Fecha de registro (más reciente)</option>
              <option value="-created_at">Fecha de registro (más antiguo)</option>
              <option value="first_name">Nombre (A-Z)</option>
              <option value="-first_name">Nombre (Z-A)</option>
              <option value="email">Email (A-Z)</option>
              <option value="-email">Email (Z-A)</option>
              <option value="role">Rol (A-Z)</option>
              <option value="-role">Rol (Z-A)</option>
            </select>
          </div>

          {/* Información de resultados */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Mostrando {state.users.length} de {state.totalUsers} usuarios
            </div>
          </div>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {state.loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando usuarios...</p>
          </div>
        ) : state.users.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No se encontraron usuarios</p>
          </div>
        ) : (
          <>
            {/* Header de tabla */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-3">Usuario</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Rol</div>
                <div className="col-span-2">Fecha registro</div>
                <div className="col-span-2">Acciones</div>
              </div>
            </div>

            {/* Filas de usuarios */}
            <div className="divide-y divide-gray-200">
              {state.users.map((user) => (
                <div key={user.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Usuario */}
                    <div className="col-span-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar_url ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.avatar_url}
                              alt=""
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {((user.first_name || user.email)?.[0] || '?').toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name || user.last_name 
                              ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                              : 'Sin nombre'
                            }
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-span-3">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      {user.phone && (
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      )}
                    </div>

                    {/* Rol */}
                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </div>

                    {/* Fecha de registro */}
                    <div className="col-span-2">
                      <div className="text-sm text-gray-900">{formatDate(user.created_at)}</div>
                    </div>

                    {/* Acciones */}
                    <div className="col-span-2">
                      {isAdmin && (
                        <div className="flex space-x-2">
                          <select
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value as 'user' | 'admin')}
                            disabled={isUpdatingRole === user.id}
                          >
                            <option value="user">Usuario</option>
                            <option value="admin">Admin</option>
                          </select>
                          {isUpdatingRole === user.id && (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            </div>
                          )}
                        </div>
                      )}
                      {!isAdmin && (
                        <span className="text-xs text-gray-500">Sin permisos</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Paginación */}
      {state.totalPages > 1 && (
        <div className="bg-white px-6 py-3 border-t border-gray-200 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Página {state.currentPage} de {state.totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setState(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                disabled={state.currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
                disabled={state.currentPage === state.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional para no admins */}
      {!isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Permisos limitados
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Solo los administradores pueden modificar roles de usuario. 
                  Tu rol actual ({getRoleLabel(currentUserRole || '')}) te permite ver la lista de usuarios.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
