-- Script para crear datos de ejemplo de pedidos
-- IMPORTANTE: Este script es solo para desarrollo y testing

-- Crear pedidos de ejemplo (asegúrate de tener usuarios en user_profiles antes)
-- Reemplaza los UUIDs con IDs reales de tu base de datos

-- Ejemplo de pedido 1 (pendiente)
INSERT INTO orders (
  id,
  user_id,
  status,
  subtotal,
  tax,
  shipping,
  discount,
  total,
  shipping_address,
  billing_address,
  payment_method,
  payment_status,
  tracking_number,
  notes,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000', -- Reemplazar con un user_id real
  'pending',
  1250.00,
  200.00,
  150.00,
  0,
  1600.00,
  '{"type": "shipping", "street": "Av. Reforma 123", "city": "Ciudad de México", "state": "CDMX", "zip_code": "01234", "country": "México"}',
  '{"type": "billing", "street": "Av. Reforma 123", "city": "Ciudad de México", "state": "CDMX", "zip_code": "01234", "country": "México"}',
  '{"type": "credit_card", "last4": "4242", "brand": "visa", "expiry_month": 12, "expiry_year": 2025}',
  'pending',
  NULL,
  'Entrega en horario de oficina',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
);

-- Ejemplo de pedido 2 (enviado)
INSERT INTO orders (
  id,
  user_id,
  status,
  subtotal,
  tax,
  shipping,
  discount,
  total,
  shipping_address,
  billing_address,
  payment_method,
  payment_status,
  tracking_number,
  notes,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000', -- Reemplazar con un user_id real
  'shipped',
  850.00,
  136.00,
  100.00,
  50.00,
  1036.00,
  '{"type": "shipping", "street": "Calle Juárez 456", "city": "Guadalajara", "state": "Jalisco", "zip_code": "44100", "country": "México"}',
  '{"type": "billing", "street": "Calle Juárez 456", "city": "Guadalajara", "state": "Jalisco", "zip_code": "44100", "country": "México"}',
  '{"type": "paypal", "email": "usuario@example.com"}',
  'completed',
  'FEDEX123456789',
  NULL,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '1 day'
);

-- Ejemplo de pedido 3 (entregado)
INSERT INTO orders (
  id,
  user_id,
  status,
  subtotal,
  tax,
  shipping,
  discount,
  total,
  shipping_address,
  billing_address,
  payment_method,
  payment_status,
  tracking_number,
  notes,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000', -- Reemplazar con un user_id real
  'delivered',
  650.00,
  104.00,
  75.00,
  25.00,
  804.00,
  '{"type": "shipping", "street": "Blvd. Díaz Ordaz 789", "city": "Monterrey", "state": "Nuevo León", "zip_code": "64000", "country": "México"}',
  '{"type": "billing", "street": "Blvd. Díaz Ordaz 789", "city": "Monterrey", "state": "Nuevo León", "zip_code": "64000", "country": "México"}',
  '{"type": "debit_card", "last4": "1234", "brand": "mastercard", "expiry_month": 8, "expiry_year": 2026}',
  'completed',
  'DHL987654321',
  'Entregado en recepción',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '3 days'
);

-- Crear productos de ejemplo si no existen (opcional)
-- Nota: Ajusta según tu estructura de productos

-- Crear items de pedido de ejemplo
-- Necesitarás los IDs reales de los pedidos y productos creados arriba

INSERT INTO order_items (
  id,
  order_id,
  product_id,
  variant_id,
  product_snapshot,
  quantity,
  size,
  color,
  unit_price,
  total_price,
  created_at
) VALUES 
-- Items para el primer pedido
(
  gen_random_uuid(),
  (SELECT id FROM orders WHERE status = 'pending' LIMIT 1),
  '00000000-0000-0000-0000-000000000001', -- Reemplazar con product_id real
  NULL,
  '{"id": "00000000-0000-0000-0000-000000000001", "name": "Vestido Elegante Rosa", "description": "Hermoso vestido para ocasiones especiales", "price": 750, "images": ["/images/vestido-rosa.jpg"], "brand": "VELVET", "material": "Seda"}',
  1,
  'M',
  'Rosa',
  750.00,
  750.00,
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM orders WHERE status = 'pending' LIMIT 1),
  '00000000-0000-0000-0000-000000000002', -- Reemplazar con product_id real
  NULL,
  '{"id": "00000000-0000-0000-0000-000000000002", "name": "Bolsa de Mano Negra", "description": "Elegante bolsa de cuero genuino", "price": 500, "images": ["/images/bolsa-negra.jpg"], "brand": "VELVET", "material": "Cuero"}',
  1,
  NULL,
  'Negro',
  500.00,
  500.00,
  NOW() - INTERVAL '2 days'
),
-- Items para el segundo pedido
(
  gen_random_uuid(),
  (SELECT id FROM orders WHERE status = 'shipped' LIMIT 1),
  '00000000-0000-0000-0000-000000000003', -- Reemplazar con product_id real
  NULL,
  '{"id": "00000000-0000-0000-0000-000000000003", "name": "Blusa Casual Blanca", "description": "Blusa cómoda para uso diario", "price": 425, "images": ["/images/blusa-blanca.jpg"], "brand": "VELVET", "material": "Algodón"}',
  2,
  'S',
  'Blanco',
  425.00,
  850.00,
  NOW() - INTERVAL '5 days'
),
-- Items para el tercer pedido
(
  gen_random_uuid(),
  (SELECT id FROM orders WHERE status = 'delivered' LIMIT 1),
  '00000000-0000-0000-0000-000000000004', -- Reemplazar con product_id real
  NULL,
  '{"id": "00000000-0000-0000-0000-000000000004", "name": "Zapatos de Tacón", "description": "Zapatos elegantes de tacón alto", "price": 650, "images": ["/images/zapatos-tacón.jpg"], "brand": "VELVET", "material": "Cuero"}',
  1,
  '25',
  'Negro',
  650.00,
  650.00,
  NOW() - INTERVAL '10 days'
);

-- Mensaje de finalización
SELECT 'Datos de ejemplo de pedidos creados exitosamente. Recuerda actualizar los UUIDs con valores reales de tu base de datos.' as mensaje;
