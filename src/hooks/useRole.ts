'use client';

import { useAuth } from './useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useRole() {
  const { user, loading } = useAuth();
  const [role, setRole] = useState<'user' | 'admin' | 'super_admin' | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setRole(null);
        setIsLoadingRole(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
        } else {
          setRole(data.role || 'user');
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

  const isAdmin = role === 'admin' || role === 'super_admin';
  const isSuperAdmin = role === 'super_admin';

  return {
    role,
    isAdmin,
    isSuperAdmin,
    isLoading: loading || isLoadingRole,
  };
}
