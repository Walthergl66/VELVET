import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  try {
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error('Error al obtener el token de acceso de PayPal');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { orderID } = await req.json();

    if (!orderID) {
      return NextResponse.json(
        { error: 'ID de orden requerido' },
        { status: 400 }
      );
    }

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Credenciales de PayPal no configuradas' },
        { status: 500 }
      );
    }

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `capture_${Date.now()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('PayPal capture error:', errorData);
      throw new Error('Error al capturar el pago de PayPal');
    }

    const captureData = await response.json();

    // Verificar que el pago fue completado exitosamente
    if (captureData.status === 'COMPLETED') {
      return NextResponse.json({
        id: captureData.id,
        status: captureData.status,
        purchase_units: captureData.purchase_units,
        payer: captureData.payer,
        create_time: captureData.create_time,
        update_time: captureData.update_time,
      });
    } else {
      return NextResponse.json(
        { error: 'El pago no pudo ser completado' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
