import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export interface PaymentData {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}

export const useStripe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = async (paymentData: PaymentData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error creando Payment Intent');
      }

      setLoading(false);
      return data.clientSecret;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  const processPayment = async (
    clientSecret: string,
    paymentMethod: {
      card: any;
      billing_details: {
        name: string;
        email: string;
        address?: {
          line1: string;
          city: string;
          state: string;
          postal_code: string;
          country: string;
        };
      };
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe no se pudo cargar');
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      setLoading(false);
      return result.paymentIntent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error procesando el pago';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  return {
    createPaymentIntent,
    processPayment,
    loading,
    error,
    clearError: () => setError(null),
  };
};
