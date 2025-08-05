'use client';

import React from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

interface PayPalProviderProps {
  children: React.ReactNode;
}

const PayPalProvider: React.FC<PayPalProviderProps> = ({ children }) => {
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!paypalClientId) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">PayPal no está configurado correctamente</p>
      </div>
    );
  }

  const initialOptions = {
    clientId: paypalClientId,
    currency: 'USD',
    intent: 'capture',
    components: 'buttons,funding-eligibility',
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
};

export default PayPalProvider;
