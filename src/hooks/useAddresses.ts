'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserAddresses } from '@/lib/supabase';
import { Address } from '@/types';

interface UseAddressesReturn {
  addresses: Address[];
  loading: boolean;
  error: string | null;
  selectedShippingAddress: Address | null;
  selectedBillingAddress: Address | null;
  setSelectedShippingAddress: (address: Address | null) => void;
  setSelectedBillingAddress: (address: Address | null) => void;
  refreshAddresses: () => Promise<void>;
}

/**
 * Hook personalizado para gestionar direcciones en el checkout
 * Proporciona direcciones guardadas y manejo de selección
 */
export function useAddresses(): UseAddressesReturn {
  const { user, isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<Address | null>(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<Address | null>(null);

  // Función para cargar direcciones
  const loadAddresses = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await getUserAddresses();

      if (fetchError) {
        throw new Error(typeof fetchError === 'string' ? fetchError : fetchError.message || 'Error al obtener direcciones');
      }

      const userAddresses = data || [];
      setAddresses(userAddresses);

      // Auto-seleccionar direcciones por defecto
      const defaultShipping = userAddresses.find(addr => 
        addr.is_default && (addr.type === 'shipping' || !addr.type)
      );
      const defaultBilling = userAddresses.find(addr => 
        addr.is_default && addr.type === 'billing'
      );

      if (defaultShipping) {
        setSelectedShippingAddress(defaultShipping);
      } else if (userAddresses.length > 0) {
        // Si no hay dirección por defecto, usar la primera disponible
        setSelectedShippingAddress(userAddresses[0]);
      }

      if (defaultBilling) {
        setSelectedBillingAddress(defaultBilling);
      } else if (defaultShipping) {
        // Usar la misma dirección de envío para facturación si no hay otra
        setSelectedBillingAddress(defaultShipping);
      } else if (userAddresses.length > 0) {
        setSelectedBillingAddress(userAddresses[0]);
      }

    } catch (err) {
      console.error('Error loading addresses:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar direcciones');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Función para refrescar direcciones
  const refreshAddresses = useCallback(async () => {
    await loadAddresses();
  }, [loadAddresses]);

  // Cargar direcciones al montar el componente
  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  return {
    addresses,
    loading,
    error,
    selectedShippingAddress,
    selectedBillingAddress,
    setSelectedShippingAddress,
    setSelectedBillingAddress,
    refreshAddresses,
  };
}
