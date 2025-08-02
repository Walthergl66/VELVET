# 🔧 Solución: Error "Bucket not found" en ImageUpload

## ❌ Problema
El error `Error uploading files: Error: Error subiendo Imagen1.jpg: Bucket not found` indica que el bucket `product-images` no está configurado en Supabase Storage.

## ✅ Solución

### Paso 1: Configurar Supabase Storage

#### Opción A: Desde el Dashboard de Supabase (Recomendado)
1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Navega a **Storage** → **Buckets**
3. Haz clic en **"New bucket"**
4. Configura el bucket:
   - **Name**: `product-images`
   - **Public bucket**: ✅ Activado
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
5. Haz clic en **"Create bucket"**

#### Opción B: Usando SQL (Avanzado)
1. Ve a **SQL Editor** en tu dashboard de Supabase
2. Ejecuta el contenido del archivo `database/storage-setup.sql`

### Paso 2: Configurar Políticas de Seguridad

En el **SQL Editor** de Supabase, ejecuta estas políticas:

```sql
-- Política para acceso público de lectura
CREATE POLICY "Public Access for Product Images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Política para permitir subida a administradores
CREATE POLICY "Allow uploads for admin users" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);
```

### Paso 3: Verificar Variables de Entorno

Asegúrate de que tienes configuradas estas variables en tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

### Paso 4: Verificar Permisos de Usuario

Asegúrate de que el usuario actual tiene rol `admin` o `super_admin` en la tabla `user_profiles`.

## 🎯 Cambios Realizados

### 1. Mejorado el componente ImageUpload
- ✅ Agregada verificación de existencia del bucket
- ✅ Mensajes de error más específicos y útiles
- ✅ Mejor manejo de errores de permisos

### 2. Creado script de configuración
- ✅ Archivo `database/storage-setup.sql` con toda la configuración necesaria

## 🧪 Para Probar la Solución

1. Configura el bucket siguiendo el Paso 1
2. Ejecuta las políticas del Paso 2
3. Intenta subir una imagen nuevamente
4. Deberías ver un mensaje de error más claro si algo falla

## 📝 Notas Importantes

- **Seguridad**: Solo usuarios con rol `admin` o `super_admin` pueden subir imágenes
- **Límites**: Máximo 5MB por imagen, formatos permitidos: JPG, PNG, WebP
- **Público**: Las imágenes subidas serán públicamente accesibles (necesario para mostrarlas en la tienda)

## 🆘 Si el Problema Persiste

1. Verifica que el bucket `product-images` existe en tu dashboard de Supabase
2. Confirma que las políticas de seguridad están activas
3. Revisa que tu usuario tiene rol de administrador
4. Verifica las variables de entorno en `.env.local`

El componente ahora proporciona mensajes de error específicos que te guiarán hacia la causa exacta del problema.
