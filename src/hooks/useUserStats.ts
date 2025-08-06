'use client';

import { useState, useEffect } from 'react';
import { getUserStats } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  favorites: number;
}

interface UseUserStatsReturn {
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserStats(): UseUserStatsReturn {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      setStats({
        totalOrders: 0,
        totalSpent: 0,
        favorites: 0
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await getUserStats();

      if (fetchError) {
        setError(fetchError);
        setStats({
          totalOrders: 0,
          totalSpent: 0,
          favorites: 0
        });
        return;
      }

      setStats(data);
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setStats({
        totalOrders: 0,
        totalSpent: 0,
        favorites: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchStats();
  };

  useEffect(() => {
    fetchStats();

    // Escuchar eventos de actualización de estadísticas
    const handleStatsUpdate = () => {
      console.log('📊 Actualizando estadísticas del usuario...');
      fetchStats();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('userStatsUpdate', handleStatsUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('userStatsUpdate', handleStatsUpdate);
      }
    };
  }, [isAuthenticated, user]);

  return {
    stats,
    loading,
    error,
    refetch
  };
}
