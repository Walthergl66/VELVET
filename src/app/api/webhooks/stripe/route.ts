// src/app/api/webhooks/stripe/route.ts
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

// Cliente de Supabase para el servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Variables de entorno de Supabase faltantes para webhook');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(req: NextRequest) {
  const body = await req.text(); // Necesario: texto crudo
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return new Response('Falta firma de Stripe', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('❌ Error verificando firma del webhook:', err.message);
    return new Response(`Error: ${err.message}`, { status: 400 });
  }

  // Manejar eventos específicos
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;

    default:
      console.log(`ℹ️ Evento recibido sin manejar: ${event.type}`);
  }

  return new Response('Evento recibido', { status: 200 });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('✅ PaymentIntent completado:', paymentIntent.id);
    
    const metadata = paymentIntent.metadata;
    const userId = metadata.userId || 'guest';
    const orderId = metadata.orderId;

    // Crear orden en la base de datos
    const orderData = {
      user_id: userId === 'guest' ? null : userId,
      payment_intent_id: paymentIntent.id,
      payment_method: 'stripe',
      payment_status: 'paid',
      status: 'confirmed',
      total: paymentIntent.amount / 100, // Convertir de centavos a pesos
      subtotal: parseFloat(metadata.subtotal || '0'),
      tax: parseFloat(metadata.tax || '0'),
      shipping: parseFloat(metadata.shipping || '0'),
      discount: parseFloat(metadata.discount || '0'),
      shipping_address: metadata.shipping_address ? JSON.parse(metadata.shipping_address) : null,
      billing_address: metadata.billing_address ? JSON.parse(metadata.billing_address) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('❌ Error creando orden:', orderError);
      return;
    }

    console.log('✅ Orden creada:', order.id);

    // Crear items de la orden si están en metadata
    if (metadata.items) {
      try {
        const items = JSON.parse(metadata.items);
        const orderItems = items.map((item: any) => ({
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          size: item.size || null,
          color: item.color || null,
          unit_price: item.price || 0,
          total_price: (item.price || 0) * item.quantity
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('❌ Error creando items de orden:', itemsError);
        } else {
          console.log('✅ Items de orden creados');
        }
      } catch (err) {
        console.error('❌ Error parseando items:', err);
      }
    }

    // Limpiar carrito del usuario si no es guest
    if (userId !== 'guest') {
      const { error: cartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (cartError) {
        console.error('❌ Error limpiando carrito:', cartError);
      } else {
        console.log('✅ Carrito limpiado');
      }
    }

  } catch (error) {
    console.error('❌ Error procesando pago exitoso:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('❌ PaymentIntent fallido:', paymentIntent.id);
    
    const metadata = paymentIntent.metadata;
    const userId = metadata.userId || 'guest';

    // Actualizar orden si existe
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: 'failed',
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('payment_intent_id', paymentIntent.id);

    if (error) {
      console.error('❌ Error actualizando orden fallida:', error);
    } else {
      console.log('✅ Orden marcada como fallida');
    }

  } catch (error) {
    console.error('❌ Error procesando pago fallido:', error);
  }
}
