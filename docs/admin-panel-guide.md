# Panel de Administración VELVET

## 🚀 Descripción General

El panel de administración de VELVET es una interfaz completa para gestionar todos los aspectos de la tienda de ropa online. Incluye funcionalidades avanzadas para la gestión de productos, imágenes, categorías, pedidos y usuarios.

## 📋 Características Principales

### 🎯 Dashboard Principal
- **Estadísticas en tiempo real**: Productos, pedidos, usuarios e ingresos
- **Pedidos recientes**: Vista rápida de las últimas transacciones
- **Productos con stock bajo**: Alertas de inventario
- **Acciones rápidas**: Enlaces directos a funciones principales

### 👕 Gestión de Productos
- **CRUD completo**: Crear, leer, actualizar y eliminar productos
- **Sistema de variantes**: Gestión completa con opciones y valores
- **Subida de imágenes**: Integración con Supabase Storage
- **Galería de imágenes**: Reordenar, eliminar y gestionar múltiples imágenes
- **Filtros avanzados**: Por categoría, búsqueda, estado y stock
- **Estados de producto**: Activar/desactivar productos

### 📷 Sistema de Imágenes
- **Subida múltiple**: Hasta 10 imágenes por producto
- **Formatos soportados**: JPEG, PNG, WebP
- **Validación automática**: Tipo de archivo y tamaño (máx. 5MB)
- **Optimización**: Compresión y nombres únicos
- **Gestión visual**: Preview, reordenar y eliminar
- **Storage seguro**: Políticas de acceso configuradas

## 🛠️ Estructura del Código

### Páginas Principales
```
src/app/admin/
├── layout.tsx           # Layout del admin con sidebar
├── page.tsx            # Dashboard principal
└── products/
    ├── page.tsx        # Listado de productos
    ├── new/
    │   └── page.tsx    # Crear nuevo producto
    └── [id]/
        └── page.tsx    # Editar producto existente
```

### Componentes
```
src/components/admin/
└── ImageUpload.tsx     # Componente de subida de imágenes
```

### Configuración de Storage
```
database/
└── storage-setup.sql   # Script SQL para configurar Supabase Storage
```

## 🔧 Instalación y Configuración

### 1. Configurar Supabase Storage

Ejecuta el script SQL para configurar el bucket de imágenes:

```sql
-- En el dashboard de Supabase SQL Editor
\i database/storage-setup.sql
```

O copia y ejecuta el contenido del archivo `database/storage-setup.sql`.

### 2. Variables de Entorno

Asegúrate de que estas variables estén configuradas en tu `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 3. Configuración del Bucket

En el dashboard de Supabase Storage:

1. Navega a **Storage** → **Buckets**
2. Verifica que existe el bucket `product-images`
3. Confirma que las políticas están activas:
   - Lectura pública para todas las imágenes
   - Subida/edición/eliminación para usuarios autenticados

## 🎨 Funcionalidades del Panel

### Dashboard
- **Métricas principales**: Contadores de productos, pedidos, usuarios
- **Ingresos totales**: Cálculo automático de ventas completadas
- **Actividad reciente**: Últimos pedidos y productos con stock bajo
- **Navegación rápida**: Accesos directos a secciones principales

### Gestión de Productos

#### Crear Producto
1. **Información básica**: Nombre, descripción, precios, categoría
2. **Subida de imágenes**: Drag & drop con preview en tiempo real
3. **Detalles adicionales**: Marca, material, peso, cuidados
4. **Opciones**: Sistema flexible para tallas, colores, estilos
5. **Etiquetas**: Sistema de tags para mejor categorización

#### Editar Producto
- **Actualización en tiempo real**: Cambios inmediatos en la base de datos
- **Gestión de imágenes**: Reordenar, eliminar, agregar nuevas
- **Control de estado**: Activar/desactivar productos
- **Historial de cambios**: Tracking automático de modificaciones

#### Listado de Productos
- **Vista de grilla**: Cards con información principal
- **Filtros múltiples**: Búsqueda, categoría, ordenamiento
- **Acciones rápidas**: Editar, activar/desactivar, eliminar
- **Paginación**: Carga optimizada de productos
- **Badges informativos**: Estado, stock bajo, destacado

### Sistema de Imágenes

#### Subida
```typescript
// Ejemplo de uso del componente ImageUpload
<ImageUpload
  onImagesUploaded={handleImagesUploaded}
  maxFiles={10}
  existingImages={product.images}
  folder="products"
/>
```

#### Validaciones
- **Tipo de archivo**: Solo imágenes (JPEG, PNG, WebP)
- **Tamaño máximo**: 5MB por imagen
- **Cantidad máxima**: 10 imágenes por producto
- **Nombres únicos**: Generación automática para evitar conflictos

#### Optimización
- **Compresión automática**: Realizada por Supabase
- **CDN global**: Distribución mundial de imágenes
- **URLs públicas**: Acceso directo sin autenticación
- **Cache**: Headers optimizados para rendimiento

## 🔒 Seguridad

### Políticas de Storage
```sql
-- Lectura pública para imágenes
CREATE POLICY "Public Access for Product Images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Subida solo para usuarios autenticados
CREATE POLICY "Allow uploads for authenticated users" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);
```

### Validaciones del Cliente
- **Autenticación requerida**: Solo usuarios autenticados pueden subir
- **Validación de archivos**: Tipo y tamaño verificados antes de subir
- **Manejo de errores**: Feedback claro al usuario en caso de fallas

## 📊 Optimización y Rendimiento

### Base de Datos
- **Índices optimizados**: Para consultas frecuentes de productos
- **Paginación**: Carga eficiente de grandes catálogos
- **Consultas selectivas**: Solo campos necesarios

### Storage
- **CDN integrado**: Supabase CDN para imágenes
- **Compresión**: Automática en el servidor
- **Lazy loading**: Carga de imágenes bajo demanda

### Frontend
- **Componentes optimizados**: React hooks para estado local
- **Debounce en búsquedas**: Evita consultas excesivas
- **Cache de imágenes**: Next.js Image optimization

## 🚀 Funcionalidades Avanzadas

### Limpieza Automática
```sql
-- Función para limpiar imágenes huérfanas
SELECT cleanup_orphaned_images();
```

### Estadísticas de Storage
```sql
-- Obtener estadísticas de uso
SELECT * FROM get_storage_stats();
```

### Validaciones Avanzadas
- **Triggers de BD**: Validación automática de archivos
- **Funciones de utilidad**: Información detallada de imágenes
- **Monitoreo**: Logs de subidas y errores

## 🔄 Flujo de Trabajo Típico

### Crear un Nuevo Producto

1. **Acceder al panel**: `/admin/products/new`
2. **Completar información básica**: Nombre, descripción, precio
3. **Subir imágenes**: Drag & drop de archivos
4. **Configurar opciones**: Tallas, colores, etc.
5. **Agregar detalles**: Marca, material, cuidados
6. **Guardar producto**: Validación y creación en BD

### Gestionar Imágenes Existentes

1. **Editar producto**: `/admin/products/[id]`
2. **Reordenar imágenes**: Botones de dirección
3. **Eliminar imágenes**: Botón de eliminar con confirmación
4. **Agregar nuevas**: Componente de subida integrado
5. **Guardar cambios**: Actualización inmediata

## 🐛 Solución de Problemas

### Errores Comunes

#### Error de subida de imágenes
```
Error: "No se puede subir la imagen"
```
**Solución**: Verificar configuración del bucket y políticas de Supabase

#### Imagen no se muestra
```
Error: "Error 403 al cargar imagen"
```
**Solución**: Confirmar que el bucket es público y la URL es correcta

#### Error de validación
```
Error: "Tipo de archivo no permitido"
```
**Solución**: Solo usar JPG, PNG, WebP con máximo 5MB

### Logs y Debugging
- **Console del navegador**: Errores de JavaScript
- **Supabase Dashboard**: Logs de storage y base de datos
- **Network tab**: Verificar requests de subida

## 📈 Próximas Mejoras

- **Editor de imágenes integrado**: Recorte y filtros
- **Gestión de categorías**: CRUD completo desde el admin
- **Sistema de permisos**: Roles de usuario diferenciados
- **Análitics avanzados**: Métricas detalladas de productos
- **Importación masiva**: CSV/Excel para productos
- **API REST**: Endpoints para integraciones externas

El panel de administración de VELVET proporciona todas las herramientas necesarias para gestionar eficientemente una tienda de ropa online moderna, con especial énfasis en la gestión visual de productos y optimización del flujo de trabajo.
