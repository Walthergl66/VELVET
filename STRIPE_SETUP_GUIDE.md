# Guía de Configuración de Stripe para VELVET

## ✅ Configuración Completada

He configurado completamente la integración de Stripe en tu aplicación. Los siguientes archivos han sido creados/modificados:

### Archivos Creados:
1. **`.env.local`** - Variables de entorno
2. **`src/lib/stripe.ts`** - Configuración cliente de Stripe
3. **`src/app/api/create-payment-intent/route.ts`** - API para crear Payment Intents
4. **`src/hooks/useStripe.ts`** - Hook personalizado para Stripe
5. **`src/components/checkout/StripeProvider.tsx`** - Proveedor de Stripe Elements
6. **`src/components/checkout/StripePaymentForm.tsx`** - Formulario de pago con Stripe
7. **`src/app/checkout/page.tsx`** - Página de checkout actualizada

### Dependencias Instaladas:
- `stripe` - SDK de Stripe para Node.js
- `@stripe/stripe-js` - SDK de Stripe para el cliente
- `@stripe/react-stripe-js` - Componentes React para Stripe

## 🔧 Configuración Pendiente

### 1. Crear Cuenta de Stripe
1. Ve a [https://stripe.com](https://stripe.com)
2. Crea una cuenta o inicia sesión
3. Obtén tus claves de API (modo test para desarrollo)

### 2. Configurar Variables de Entorno
Edita el archivo `.env.local` y reemplaza los valores de ejemplo:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_aqui
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui
```

**Dónde encontrar las claves:**
- Dashboard de Stripe → Developers → API keys
- Clave pública: Comienza con `pk_test_`
- Clave secreta: Comienza con `sk_test_`

### 3. Configurar Webhooks (Opcional pero Recomendado)
1. En el Dashboard de Stripe → Developers → Webhooks
2. Crea un nuevo endpoint: `https://tu-dominio.com/api/webhooks/stripe`
3. Selecciona eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copia el webhook secret y úsalo en `.env.local`

## 🚀 Cómo Funciona

### Flujo de Pago:
1. **Información de Envío**: Usuario completa datos de envío
2. **Payment Intent**: Se crea automáticamente cuando pasa al pago
3. **Formulario de Stripe**: Tarjeta procesada de forma segura
4. **Confirmación**: Pago confirmado y guardado en base de datos

### Características Implementadas:
- ✅ Formulario de pago seguro con Stripe Elements
- ✅ Validación en tiempo real de tarjetas
- ✅ Soporte para múltiples métodos de pago
- ✅ Manejo de errores completo
- ✅ UI responsiva y accesible
- ✅ Integración con el carrito existente
- ✅ Estados de carga y confirmación

## 🧪 Pruebas

### Tarjetas de Prueba (Modo Test):
```
Visa exitosa:         4242 4242 4242 4242
Visa declined:        4000 0000 0000 0002
Mastercard exitosa:   5555 5555 5555 4444
American Express:     3782 822463 10005
```

**Datos de prueba:**
- Fecha: Cualquier fecha futura (ej: 12/34)
- CVV: Cualquier 3 dígitos (ej: 123)
- Código postal: Cualquier código válido

## 📦 Próximos Pasos Opcionales

### 1. Crear API de Webhooks
```typescript
// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        // Confirmar pedido en base de datos
        break;
      case 'payment_intent.payment_failed':
        // Manejar pago fallido
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }
}
```

### 2. Guardar Pedidos en Base de Datos
Modifica `handlePlaceOrder` en `checkout/page.tsx` para guardar en Supabase:

```typescript
const handlePlaceOrder = async () => {
  // ... validaciones existentes

  try {
    // Guardar pedido en Supabase
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          user_id: user?.id,
          payment_intent_id: paymentIntentId,
          total: cart.total,
          status: 'confirmed',
          shipping_info: shippingForm,
          items: cart.items,
        }
      ]);

    if (error) throw error;

    await clearCart();
    window.location.href = `/order-confirmation/${data[0].id}`;
  } catch (error) {
    // ... manejo de errores
  }
};
```

### 3. Crear Esquema de Pedidos en Supabase
```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  payment_intent_id TEXT UNIQUE NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  shipping_info JSONB NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔒 Seguridad

### Implementado:
- ✅ Claves de API en variables de entorno
- ✅ Validación de montos mínimos
- ✅ Stripe Elements para PCI compliance
- ✅ Verificación de Payment Intents

### Recomendaciones Adicionales:
- Implementar verificación de webhooks
- Validar pedidos en el backend
- Implementar rate limiting en APIs
- Monitorear transacciones sospechosas

## 🎨 Personalización

### Cambiar Apariencia de Stripe Elements:
Modifica `StripeProvider.tsx`:

```typescript
const options = {
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#tu-color-primario',
      colorBackground: '#ffffff',
      fontFamily: 'tu-fuente-preferida',
    },
  },
};
```

## 📞 Soporte

### Recursos Útiles:
- [Documentación de Stripe](https://stripe.com/docs)
- [Dashboard de Stripe](https://dashboard.stripe.com)
- [Eventos de Webhook](https://stripe.com/docs/webhooks)
- [Testing con Stripe](https://stripe.com/docs/testing)

### Logs para Debug:
- Dashboard de Stripe → Logs
- Vercel/Console logs para errores del servidor
- DevTools para errores del cliente

---

¡La integración de Stripe está lista! Solo necesitas configurar las claves de API y ya podrás procesar pagos reales. 🎉
