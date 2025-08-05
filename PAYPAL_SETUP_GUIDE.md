# Guía de Configuración de PayPal

Esta guía te ayudará a configurar PayPal como método de pago en tu aplicación VELVET.

## 1. Crear una Cuenta de Desarrollador de PayPal

1. Ve a [PayPal Developer](https://developer.paypal.com/)
2. Inicia sesión con tu cuenta de PayPal o crea una nueva
3. Acepta los términos y condiciones de desarrollador

## 2. Crear una Aplicación

1. En el dashboard de PayPal Developer, haz clic en "Create App"
2. Completa la información:
   - **App Name**: VELVET Store (o el nombre que prefieras)
   - **Merchant**: Selecciona tu cuenta
   - **Platform**: Web
   - **Product**: Checkout
3. Haz clic en "Create App"

## 3. Obtener las Credenciales

### Para Desarrollo (Sandbox)
En la página de tu aplicación, encontrarás:
- **Client ID**: Tu ID de cliente público
- **Client Secret**: Tu clave secreta (mantener privada)

### Para Producción
1. Cambia el toggle de "Sandbox" a "Live"
2. Completa el proceso de verificación de tu cuenta
3. Obtén las credenciales de producción

## 4. Configurar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env.local`:

```bash
# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=tu_paypal_client_id_aqui
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret_aqui
```

### Ejemplo para Sandbox:
```bash
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AcGQYhZdWzOhKO8nkf7w8aO9Ytn1234567890
PAYPAL_CLIENT_SECRET=ENhJG5_ABCDEF1234567890-abcdefghijklmnop
```

## 5. Configurar Webhooks (Opcional pero Recomendado)

1. En tu aplicación de PayPal, ve a "Webhooks"
2. Haz clic en "Add Webhook"
3. Configura:
   - **Webhook URL**: `https://tu-dominio.com/api/pay-pal/webhooks`
   - **Event types**: Selecciona los eventos que quieres recibir:
     - Payment capture completed
     - Payment capture denied
     - Payment capture pending
     - Payment capture refunded

## 6. Configuración de Monedas

PayPal maneja múltiples monedas. En el código actual:
- Los precios en MXN se convierten automáticamente a USD
- Puedes modificar la conversión en `/api/pay-pal/create-order/route.ts`
- Para obtener tasas de cambio en tiempo real, considera usar una API como:
  - [ExchangeRate-API](https://exchangerate-api.com/)
  - [CurrencyAPI](https://currencyapi.com/)

## 7. Pruebas

### Cuentas de Prueba
PayPal proporciona cuentas de prueba en el entorno Sandbox:

**Comprador de Prueba:**
- Email: buyer@personal.example.com
- Contraseña: 11111111

**Vendedor de Prueba:**
- Email: seller@business.example.com
- Contraseña: 11111111

### Tarjetas de Prueba
No necesitas tarjetas reales en Sandbox, PayPal simula los pagos.

## 8. Ir a Producción

1. Verifica que tu cuenta esté completamente verificada
2. Cambia las variables de entorno a las credenciales de producción
3. Actualiza `NODE_ENV=production` en tu servidor
4. Verifica que los webhooks apunten a tu dominio de producción

## 9. Consideraciones de Seguridad

- **NUNCA** expongas el `CLIENT_SECRET` en el frontend
- Todas las operaciones críticas se realizan en el backend
- Valida siempre los pagos en el servidor antes de confirmar pedidos
- Implementa logs para monitorear transacciones

## 10. Troubleshooting

### Error: "PayPal no está configurado correctamente"
- Verifica que `NEXT_PUBLIC_PAYPAL_CLIENT_ID` esté definido
- Asegúrate de que las variables de entorno estén cargadas correctamente

### Error: "Error al crear la orden de PayPal"
- Verifica el `PAYPAL_CLIENT_SECRET` en el backend
- Revisa los logs del servidor para más detalles
- Confirma que la aplicación de PayPal esté activa

### Pagos no se procesan
- Verifica que estés usando las credenciales correctas (Sandbox vs Live)
- Confirma que los webhooks estén configurados correctamente
- Revisa el estado de tu cuenta de PayPal

## 11. Recursos Adicionales

- [Documentación Oficial de PayPal](https://developer.paypal.com/docs/)
- [PayPal SDK para JavaScript](https://github.com/paypal/paypal-js)
- [React PayPal JS](https://github.com/paypal/react-paypal-js)

## 12. Soporte

Si tienes problemas:
1. Revisa la documentación oficial de PayPal
2. Verifica los logs de tu aplicación
3. Contacta al soporte técnico de PayPal si es necesario
