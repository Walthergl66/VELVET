import React, { Suspense } from 'react';
import CheckoutSuccessContent from './CheckoutSuccessContent';

export const metadata = {
  title: 'Pago Exitoso',
};

export const viewport = {
  themeColor: '#ffffff',
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Cargando...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
