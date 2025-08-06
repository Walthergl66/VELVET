-- Tabla para almacenar configuraciones del sistema
CREATE TABLE IF NOT EXISTS system_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Índice para búsquedas en JSON
CREATE INDEX IF NOT EXISTS idx_system_settings_jsonb ON system_settings USING GIN (settings);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar configuraciones por defecto si no existen
INSERT INTO system_settings (id, settings) 
VALUES (1, '{
  "siteName": "VELVET",
  "siteDescription": "Tu tienda de moda favorita",
  "contactEmail": "contacto@velvet.com",
  "supportPhone": "+593 99 123 4567",
  "address": "Quito, Ecuador",
  "currency": "USD",
  "taxRate": 12,
  "freeShippingThreshold": 100,
  "defaultShippingCost": 15,
  "businessHours": "Lunes a Viernes: 9:00 AM - 6:00 PM",
  "socialMedia": {
    "facebook": "",
    "instagram": "",
    "twitter": "",
    "whatsapp": "+593991234567"
  },
  "emailNotifications": {
    "orderConfirmation": true,
    "lowStock": true,
    "newOrders": true,
    "userRegistration": false
  },
  "maintenanceMode": false,
  "maintenanceMessage": "Estamos realizando mantenimiento. Vuelve pronto.",
  "featuredProductsLimit": 8,
  "productsPerPage": 12,
  "allowGuestCheckout": false,
  "requireEmailVerification": true,
  "autoApproveProducts": false,
  "enableReviews": true,
  "enableWishlist": true,
  "enableCoupons": true
}')
ON CONFLICT (id) DO NOTHING;

-- Políticas de RLS (Row Level Security)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden leer la configuración
CREATE POLICY "Admin can read system settings" ON system_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Solo admins pueden actualizar la configuración
CREATE POLICY "Admin can update system settings" ON system_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Solo admins pueden insertar configuración
CREATE POLICY "Admin can insert system settings" ON system_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE system_settings IS 'Configuraciones globales del sistema de e-commerce';
COMMENT ON COLUMN system_settings.id IS 'ID único (siempre 1 para configuración singleton)';
COMMENT ON COLUMN system_settings.settings IS 'Configuraciones del sistema en formato JSON';
COMMENT ON COLUMN system_settings.created_at IS 'Fecha de creación de la configuración';
COMMENT ON COLUMN system_settings.updated_at IS 'Fecha de última actualización';
