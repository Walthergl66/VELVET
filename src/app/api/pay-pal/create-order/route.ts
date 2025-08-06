import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  try {
    console.log('🔐 Requesting PayPal access token...');
    console.log('PayPal base URL:', PAYPAL_BASE_URL);
    
    const authString = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    console.log('Auth string length:', authString.length);

    const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    console.log('PayPal token response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PayPal token error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Error al obtener el token de acceso de PayPal: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ PayPal access token obtained');
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('📥 PayPal create-order API called');
    
    const { amount, currency = 'USD', items, shippingInfo } = await req.json();

    console.log('PayPal order request:', { amount, currency, items: items?.length || 0 });

    if (!amount || amount <= 0) {
      console.error('❌ Invalid amount:', amount);
      return NextResponse.json(
        { error: 'El monto debe ser mayor a 0' },
        { status: 400 }
      );
    }

    console.log('🔑 Checking PayPal credentials...');
    console.log('Environment variables:', {
      NODE_ENV: process.env.NODE_ENV,
      PAYPAL_BASE_URL,
      hasClientId: !!PAYPAL_CLIENT_ID,
      hasClientSecret: !!PAYPAL_CLIENT_SECRET,
      clientIdLength: PAYPAL_CLIENT_ID?.length || 0,
      clientSecretLength: PAYPAL_CLIENT_SECRET?.length || 0
    });

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      console.error('PayPal credentials missing:', { 
        hasClientId: !!PAYPAL_CLIENT_ID, 
        hasClientSecret: !!PAYPAL_CLIENT_SECRET 
      });
      return NextResponse.json(
        { error: 'Credenciales de PayPal no configuradas' },
        { status: 500 }
      );
    }

    console.log('🔐 Getting PayPal access token...');
    const accessToken = await getPayPalAccessToken();
    console.log('✅ Access token obtained successfully');

    // Como trabajamos en USD, no necesitamos conversión
    const amountInUSD = amount.toFixed(2);
    console.log('Amount in USD:', { original: amount, converted: amountInUSD });

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amountInUSD,
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: "UNRESTRICTED",
            shipping_preference: "NO_SHIPPING"
          }
        }
      }
    };

    console.log('Creating PayPal order with data:', JSON.stringify(orderData, null, 2));

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `order_${Date.now()}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('PayPal order creation error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        orderData: JSON.stringify(orderData, null, 2)
      });
      return NextResponse.json(
        { error: `Error al crear la orden de PayPal: ${response.status} - ${errorData}` },
        { status: response.status }
      );
    }

    const order = await response.json();
    console.log('PayPal order created successfully:', { 
      orderId: order.id, 
      status: order.status,
      fullOrder: JSON.stringify(order, null, 2)
    });

    return NextResponse.json({
      id: order.id,
      status: order.status,
      links: order.links,
    });

  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
