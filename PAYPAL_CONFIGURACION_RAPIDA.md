# Configuración Rápida de PayPal

## Pasos para configurar PayPal en VELVET:

### 1. Obtener Credenciales de PayPal (Sandbox para pruebas)

1. Ve a: https://developer.paypal.com/
2. Inicia sesión o crea una cuenta
3. Ve a "My Apps & Credentials"
4. En la sección "Sandbox", haz clic en "Create App"
5. Completa:
   - App Name: "VELVET Store"
   - Sandbox Business Account: selecciona una cuenta o crea una nueva
   - Features: marca "Accept Payments"
6. Haz clic en "Create App"

### 2. Obtener las Credenciales

Después de crear la app, verás:
- **Client ID**: (empieza con "A" y tiene muchos caracteres)
- **Client Secret**: (haz clic en "Show" para verlo)

### 3. Configurar Variables de Entorno

Edita el archivo `.env.local` en la raíz del proyecto:

```bash
# PayPal Configuration (Sandbox)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=TU_CLIENT_ID_AQUI
PAYPAL_CLIENT_SECRET=TU_CLIENT_SECRET_AQUI
```

**Ejemplo real (para sandbox):**
```bash
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AcGQYhZdWzOhKO8nkf7w8aO9Ytn1234567890
PAYPAL_CLIENT_SECRET=ENhJG5_ABCDEF1234567890-abcdefghijklmnop
```

### 4. Reiniciar el Servidor

```bash
npm run dev
```

### 5. Probar PayPal

1. Ve a tu tienda: http://localhost:8080
2. Agrega productos al carrito
3. Ve al checkout
4. Selecciona "PayPal" como método de pago
5. Usa las credenciales de prueba:

**Cuenta de prueba para comprador:**
- Email: sb-buyer@personal.example.com
- Password: 12345678

### 6. Verificar Logs

Si hay errores, revisa la consola del navegador y la terminal donde corre el servidor.

### 7. Para Producción (cuando estés listo)

1. Cambia el toggle en PayPal Developer de "Sandbox" a "Live"
2. Crea una nueva app para producción
3. Actualiza las variables de entorno con las credenciales de producción
4. Cambia `NODE_ENV=production` en el servidor

## Troubleshooting

### Error: "PayPal no está configurado correctamente"
- Verifica que `NEXT_PUBLIC_PAYPAL_CLIENT_ID` esté en `.env.local`
- Reinicia el servidor después de agregar las variables

### Error: "Error al crear la orden de PayPal"
- Verifica que `PAYPAL_CLIENT_SECRET` esté configurado
- Revisa los logs del servidor en la terminal
- Asegúrate de que la app de PayPal esté activa

### Los botones de PayPal no aparecen
- Abre las herramientas de desarrollador (F12)
- Revisa si hay errores en la consola
- Verifica que el Client ID sea correcto
