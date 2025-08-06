-- Tabla para las configuraciones del sistema
-- Almacena todas las configuraciones globales de la aplicación

CREATE TABLE IF NOT EXISTS public.system_settings (
    id integer NOT NULL DEFAULT 1,
    settings jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT system_settings_pkey PRIMARY KEY (id),
    CONSTRAINT system_settings_single_row CHECK (id = 1)
);

-- Insertar configuraciones por defecto
INSERT INTO public.system_settings (id, settings) VALUES (1, '{
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

-- Habilitar RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Política para que solo los admins puedan leer las configuraciones
CREATE POLICY "Admin can read system settings" ON public.system_settings
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Política para que solo los admins puedan actualizar las configuraciones
CREATE POLICY "Admin can update system settings" ON public.system_settings
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION public.update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON public.system_settings;
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_system_settings_updated_at();
