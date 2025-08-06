import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    hasPayPalClientId: !!process.env.PAYPAL_CLIENT_ID,
    hasPayPalClientSecret: !!process.env.PAYPAL_CLIENT_SECRET,
    paypalClientIdLength: process.env.PAYPAL_CLIENT_ID?.length || 0,
    paypalClientSecretLength: process.env.PAYPAL_CLIENT_SECRET?.length || 0,
    baseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com',
  });
}
