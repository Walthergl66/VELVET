'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Hook para gestionar las configuraciones del sistema
 * Permite leer y actualizar configuraciones globales
 */

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  address: string;
  currency: string;
  taxRate: number;
  freeShippingThreshold: number;
  defaultShippingCost: number;
  businessHours: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    whatsapp: string;
  };
  emailNotifications: {
    orderConfirmation: boolean;
    lowStock: boolean;
    newOrders: boolean;
    userRegistration: boolean;
  };
  maintenanceMode: boolean;
  maintenanceMessage: string;
  featuredProductsLimit: number;
  productsPerPage: number;
  allowGuestCheckout: boolean;
  requireEmailVerification: boolean;
  autoApproveProducts: boolean;
  enableReviews: boolean;
  enableWishlist: boolean;
  enableCoupons: boolean;
}

interface UseSystemSettingsReturn {
  settings: SystemSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
}

const defaultSettings: SystemSettings = {
  siteName: 'VELVET',
  siteDescription: 'Tu tienda de moda favorita',
  contactEmail: 'contacto@velvet.com',
  supportPhone: '+593 99 123 4567',
  address: 'Quito, Ecuador',
  currency: 'USD',
  taxRate: 12,
  freeShippingThreshold: 100,
  defaultShippingCost: 15,
  businessHours: 'Lunes a Viernes: 9:00 AM - 6:00 PM',
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: '',
    whatsapp: '+593991234567'
  },
  emailNotifications: {
    orderConfirmation: true,
    lowStock: true,
    newOrders: true,
    userRegistration: false
  },
  maintenanceMode: false,
  maintenanceMessage: 'Estamos realizando mantenimiento. Vuelve pronto.',
  featuredProductsLimit: 8,
  productsPerPage: 12,
  allowGuestCheckout: false,
  requireEmailVerification: true,
  autoApproveProducts: false,
  enableReviews: true,
  enableWishlist: true,
  enableCoupons: true
};

export function useSystemSettings(): UseSystemSettingsReturn {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('system_settings')
        .select('settings')
        .eq('id', 1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data?.settings) {
        setSettings({
          ...defaultSettings,
          ...data.settings
        });
      } else {
        // Si no hay configuraciones, usar las por defecto
        setSettings(defaultSettings);
      }
    } catch (err) {
      console.error('Error loading system settings:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar configuraciones');
      // En caso de error, usar configuraciones por defecto
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<SystemSettings>) => {
    try {
      setError(null);

      if (!settings) {
        throw new Error('No se pueden actualizar configuraciones: configuraciones no cargadas');
      }

      const updatedSettings: SystemSettings = {
        ...settings,
        ...newSettings
      };

      const { error: updateError } = await supabase
        .from('system_settings')
        .upsert({
          id: 1,
          settings: updatedSettings,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      // Actualizar el estado local inmediatamente
      setSettings(updatedSettings);
    } catch (err) {
      console.error('Error updating system settings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar configuraciones';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [settings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings
  };
}

/**
 * Hook simple para obtener configuraciones específicas del sistema
 * Útil cuando solo necesitas leer ciertas configuraciones
 */
export function useSystemSetting<K extends keyof SystemSettings>(
  key: K
): SystemSettings[K] | null {
  const { settings } = useSystemSettings();
  return settings ? settings[key] : null;
}

/**
 * Hook para verificar si el modo mantenimiento está activo
 */
export function useMaintenanceMode(): boolean {
  const maintenanceMode = useSystemSetting('maintenanceMode');
  return maintenanceMode || false;
}
