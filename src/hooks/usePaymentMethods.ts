import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit';
  brand: 'visa' | 'mastercard' | 'amex' | 'other';
  lastFour: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  isDefault: boolean;
  createdAt: string;
}

export const usePaymentMethods = () => {
  const { user, isAuthenticated } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadPaymentMethods();
    }
  }, [isAuthenticated]);

  const loadPaymentMethods = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulamos la carga desde la base de datos
      // En producción, esto vendría de Supabase o tu API
      const savedMethods = localStorage.getItem(`payment_methods_${user?.id || 'guest'}`);
      
      if (savedMethods) {
        setPaymentMethods(JSON.parse(savedMethods));
      } else {
        // Datos de ejemplo si no hay métodos guardados
        const defaultMethods: PaymentMethod[] = [
          {
            id: '1',
            type: 'credit',
            brand: 'visa',
            lastFour: '4242',
            expiryMonth: 12,
            expiryYear: 2025,
            holderName: 'Juan Pérez',
            isDefault: true,
            createdAt: '2024-01-15'
          },
          {
            id: '2',
            type: 'debit',
            brand: 'mastercard',
            lastFour: '5555',
            expiryMonth: 8,
            expiryYear: 2026,
            holderName: 'Juan Pérez',
            isDefault: false,
            createdAt: '2024-02-20'
          }
        ];
        
        setPaymentMethods(defaultMethods);
        localStorage.setItem(`payment_methods_${user?.id || 'guest'}`, JSON.stringify(defaultMethods));
      }
    } catch (err) {
      setError('Error al cargar los métodos de pago');
      console.error('Error loading payment methods:', err);
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async (method: Omit<PaymentMethod, 'id' | 'createdAt'>) => {
    try {
      const newMethod: PaymentMethod = {
        ...method,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      const updatedMethods = [...paymentMethods, newMethod];
      setPaymentMethods(updatedMethods);
      localStorage.setItem(`payment_methods_${user?.id || 'guest'}`, JSON.stringify(updatedMethods));
      
      return newMethod;
    } catch (err) {
      setError('Error al agregar el método de pago');
      throw err;
    }
  };

  const removePaymentMethod = async (id: string) => {
    try {
      const updatedMethods = paymentMethods.filter(method => method.id !== id);
      setPaymentMethods(updatedMethods);
      localStorage.setItem(`payment_methods_${user?.id || 'guest'}`, JSON.stringify(updatedMethods));
    } catch (err) {
      setError('Error al eliminar el método de pago');
      throw err;
    }
  };

  const setDefaultPaymentMethod = async (id: string) => {
    try {
      const updatedMethods = paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id
      }));
      setPaymentMethods(updatedMethods);
      localStorage.setItem(`payment_methods_${user?.id || 'guest'}`, JSON.stringify(updatedMethods));
    } catch (err) {
      setError('Error al establecer método de pago predeterminado');
      throw err;
    }
  };

  const getDefaultPaymentMethod = () => {
    return paymentMethods.find(method => method.isDefault) || paymentMethods[0];
  };

  return {
    paymentMethods,
    loading,
    error,
    loadPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    getDefaultPaymentMethod
  };
};
