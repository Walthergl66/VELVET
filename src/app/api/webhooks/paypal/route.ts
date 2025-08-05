// src/app/api/webhooks/paypal/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const eventType = body.event_type;
  const resource = body.resource;

  // Aquí decides qué hacer según el evento
  if (eventType === 'CHECKOUT.ORDER.APPROVED') {
    console.log('Orden aprobada:', resource.id);
    // Puedes guardar en Supabase o activar lógica
  }

  if (eventType === 'CHECKOUT.ORDER.COMPLETED') {
    console.log('Orden completada:', resource.id);
    // Confirmar pago en tu base de datos
  }

  return NextResponse.json({ received: true });
}
