// src/app/api/webhooks/stripe/route.ts
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

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
      console.log('✅ PaymentIntent completado:', event.data.object);
      break;

    case 'payment_intent.payment_failed':
      console.log('❌ PaymentIntent fallido:', event.data.object);
      break;

    default:
      console.log(`ℹ️ Evento recibido sin manejar: ${event.type}`);
  }

  return new Response('Evento recibido', { status: 200 });
}
