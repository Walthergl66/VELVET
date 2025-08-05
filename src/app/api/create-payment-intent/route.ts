import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil', // Usa la versión requerida por el tipo.
});

export async function POST(request: NextRequest) {
  try {
    const { 
      amount, 
      currency = 'usd', 
      metadata = {},
      shippingInfo,
      cartItems
    } = await request.json();

    if (!amount || amount < 0.50) {
      return NextResponse.json(
        { error: 'El monto debe ser al menos $0.50 USD' },
        { status: 400 }
      );
    }

    // Convertir metadata a strings planas y agregar información adicional
    const flattenedMetadata: Record<string, string> = {};
    
    // Metadata base
    if (metadata && typeof metadata === 'object') {
      Object.entries(metadata).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            flattenedMetadata[`${key}_${subKey}`] = String(subValue);
          });
        } else {
          flattenedMetadata[key] = String(value);
        }
      });
    }

    // Agregar información del shipping
    if (shippingInfo) {
      flattenedMetadata.shipping_address = JSON.stringify(shippingInfo);
      flattenedMetadata.billing_address = JSON.stringify(shippingInfo); // Usar la misma por defecto
    }

    // Agregar información de items del carrito
    if (cartItems && Array.isArray(cartItems)) {
      flattenedMetadata.items = JSON.stringify(cartItems);
      flattenedMetadata.items_count = String(cartItems.length);
    }

    // Calcular breakdown de costos
    const subtotal = amount * 0.86; // Aproximado sin tax y shipping
    const tax = amount * 0.14; // 14% aproximado
    const shipping = 0; // Ajustar según lógica
    
    flattenedMetadata.subtotal = subtotal.toFixed(2);
    flattenedMetadata.tax = tax.toFixed(2);
    flattenedMetadata.shipping = shipping.toFixed(2);
    flattenedMetadata.discount = '0.00';

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: flattenedMetadata,
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Pedido VELVET - ${flattenedMetadata.orderId || 'ID no disponible'}`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error('Error creando Payment Intent:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
