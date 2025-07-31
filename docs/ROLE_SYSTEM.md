# Sistema de Validación de Usuarios por Rol - VELVET

## Descripción

Sistema completo de autenticación y autorización basado en roles para la aplicación VELVET. Incluye tres niveles de acceso: usuario, administrador y super administrador.

## Características Implementadas

### 🔐 Roles de Usuario
- **user**: Usuario estándar con acceso a funciones básicas
- **admin**: Administrador con acceso al panel de administración
- **super_admin**: Super administrador con acceso completo al sistema

### 🛡️ Protección de Rutas
- Middleware de Next.js para validación básica
- Componente AdminLayout con validación de permisos
- Redirección automática según rol al hacer login

### 🚀 Funcionalidades
- Hook personalizado `useRole` para gestión de roles
- Validación en tiempo real de permisos
- Interfaz visual diferenciada por rol
- Gestión de usuarios administrativos

## Archivos Creados/Modificados

### Nuevos Archivos
```
src/hooks/useRole.ts                          # Hook para gestión de roles
src/components/user/UserRoleInfo.tsx          # Componente de información de rol
database/user-roles.sql                      # Schema de roles y políticas RLS
database/user-management.sql                 # Funciones de gestión de usuarios
middleware.ts                                # Middleware de protección de rutas
```

### Archivos Modificados
```
src/types/index.ts                           # Agregado campo 'role' a user_profiles
src/app/admin/layout.tsx                     # Validación de permisos de admin
src/components/auth/AuthForm.tsx             # Redirección por rol al login
```

## Instalación y Configuración

### 1. Configurar Base de Datos

Ejecutar los siguientes scripts SQL en tu instancia de Supabase:

```sql
-- 1. Configurar el sistema de roles
\i database/user-roles.sql

-- 2. Configurar funciones de gestión de usuarios
\i database/user-management.sql
```

### 2. Verificar Tipos TypeScript

El campo `role` ya ha sido agregado a la interfaz `user_profiles` en `src/types/index.ts`:

```typescript
interface UserProfile {
  role: 'user' | 'admin' | 'super_admin';
  // ... otros campos
}
```

### 3. Configurar Primer Super Admin

Una vez que tengas un usuario registrado, promoverlo a super admin:

```sql
-- Reemplazar 'tu-email@example.com' con el email del usuario
SELECT promote_user_to_super_admin('tu-email@example.com');
```

## Uso del Sistema

### Para Desarrolladores

#### Verificar Rol del Usuario
```typescript
import { useRole } from '@/hooks/useRole';

function MyComponent() {
  const { role, isAdmin, isSuperAdmin, isLoading } = useRole();
  
  if (isLoading) return <div>Cargando...</div>;
  
  return (
    <div>
      {isAdmin && <AdminPanel />}
      {isSuperAdmin && <SuperAdminTools />}
    </div>
  );
}
```

#### Proteger Componentes
```typescript
import { useRole } from '@/hooks/useRole';

function AdminOnlyComponent() {
  const { isAdmin } = useRole();
  
  if (!isAdmin) {
    return <div>Acceso denegado</div>;
  }
  
  return <div>Contenido administrativo</div>;
}
```

### Para Administradores

#### Gestión de Usuarios

Funciones SQL disponibles para gestión de roles:

```sql
-- Promover a administrador
SELECT promote_user_to_admin('user@example.com');

-- Promover a super administrador
SELECT promote_user_to_super_admin('user@example.com');

-- Degradar a usuario normal
SELECT demote_user_to_normal('admin@example.com');

-- Ver todos los usuarios y roles
SELECT * FROM users_with_roles;

-- Contar usuarios por rol
SELECT * FROM count_users_by_role();
```

## Flujo de Autenticación

### 1. Registro
1. Usuario se registra normalmente
2. Se crea perfil con rol 'user' por defecto
3. Redirige a `/user/dashboard`

### 2. Login
1. Usuario inicia sesión
2. Sistema verifica rol en `user_profiles`
3. Redirige según rol:
   - `admin` o `super_admin` → `/admin`
   - `user` → `/user/dashboard`

### 3. Acceso a Admin
1. Usuario intenta acceder a `/admin/*`
2. `AdminLayout` verifica permisos
3. Si no es admin: muestra página de acceso denegado
4. Si es admin: permite acceso

## Políticas de Seguridad (RLS)

### Row Level Security configurado para:
- **Productos**: Solo admins pueden crear/editar
- **Categorías**: Solo admins pueden gestionar
- **Pedidos**: Usuarios ven solo los suyos, admins ven todos
- **Perfiles**: Usuarios ven solo el suyo, super admins ven todos
- **Storage**: Solo admins pueden subir imágenes

### Funciones de Utilidad
```sql
-- Verificar si el usuario actual es admin
SELECT is_admin();

-- Verificar si el usuario actual es super admin
SELECT is_super_admin();
```

## Próximas Mejoras

### Funcionalidades Sugeridas
- [ ] Panel de gestión de usuarios en la interfaz web
- [ ] Logs de actividad administrativa
- [ ] Roles personalizados adicionales
- [ ] Permisos granulares por módulo
- [ ] API endpoints para gestión de roles
- [ ] Notificaciones de cambios de rol

### Seguridad Adicional
- [ ] Autenticación de dos factores para admins
- [ ] Sesiones con timeout más corto para admins
- [ ] Auditoría de acciones administrativas
- [ ] Whitelist de IPs para super admins

## Problemas Conocidos

1. **Cache de Roles**: Los cambios de rol requieren logout/login para reflejarse
2. **Middleware Limitado**: La verificación completa se hace en el cliente
3. **Sin Rate Limiting**: No hay límites de intentos de acceso administrativo

## Soporte

Para problemas o preguntas sobre el sistema de roles:
1. Revisar logs de Supabase
2. Verificar políticas RLS
3. Comprobar configuración de tipos TypeScript
4. Validar que los scripts SQL se ejecutaron correctamente

---

**Nota**: Este sistema está diseñado para aplicaciones con niveles de acceso moderados. Para aplicaciones enterprise, considerar soluciones más robustas como Auth0 o AWS Cognito.
