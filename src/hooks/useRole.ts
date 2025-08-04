'use client';

import { useAuth } from './useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useRole() {
  const { user, loading } = useAuth();
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setRole(null);
        setIsLoadingRole(false);
        return;
      }

      try {
        console.log('Obteniendo rol para usuario:', user.id);
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role, first_name, last_name, email')
          .eq('id', user.id)
          .single();

        console.log('Datos del perfil obtenidos:', data);

        if (error) {
          console.error('Error fetching user role:', error);
          
          // Si es un error de RLS, intentar una consulta más específica
          if (error.code === 'PGRST116') {
            console.log('Error de RLS detectado, reintentando...');
            
            // Intentar nuevamente después de un breve delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { data: retryData, error: retryError } = await supabase
              .from('user_profiles')
              .select('role')
              .eq('id', user.id)
              .single();
              
            console.log('Reintento - Datos:', retryData);
            console.log('Reintento - Error:', retryError);
            
            if (retryError) {
              setRole(null);
            } else {
              setRole(retryData.role || 'user');
            }
          } else {
            setRole(null);
          }
        } else {
          setRole(data.role || 'user');
          console.log('Rol establecido:', data.role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
      } finally {
        setIsLoadingRole(false);
      }
    }

    if (!loading) {
      fetchUserRole();
    }
  }, [user, loading]);

  const isAdmin = role === 'admin';

  return {
    role,
    isAdmin,
    isLoading: loading || isLoadingRole,
  };
}
