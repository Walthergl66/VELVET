# 🚀 Guía de Instalación VELVET

## Prerrequisitos

### 1. Instalar Node.js
- Descargar desde: https://nodejs.org/
- Versión requerida: Node.js 20 o superior
- Verificar instalación: `node --version`

### 2. Instalar PostgreSQL
- Descargar desde: https://www.postgresql.org/download/
- Crear una base de datos llamada `medusa-v2`
- Anotar: host, puerto, usuario y contraseña

### 3. Instalar Redis
- Windows: Descargar desde https://github.com/MicrosoftArchive/redis/releases
- O usar Docker: `docker run --name redis -p 6379:6379 -d redis`

## Configuración del Backend (Medusa)

### 1. Navegar al directorio del backend
```powershell
cd "c:\Users\Jesus\Downloads\VELVET\velvet"
```

### 2. Instalar dependencias
```powershell
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env` basado en `.env.template`:

```bash
# Configuración de CORS
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:5173,http://localhost:9000
AUTH_CORS=http://localhost:5173,http://localhost:9000

# Redis
REDIS_URL=redis://localhost:6379

# Secretos (cambiar en producción)
JWT_SECRET=tu_jwt_secreto_seguro_aqui
COOKIE_SECRET=tu_cookie_secreto_seguro_aqui

# Base de Datos PostgreSQL
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/medusa-v2
POSTGRES_URL=postgresql://usuario:contraseña@localhost:5432/medusa-v2
```

### 4. Ejecutar migraciones y seed
```powershell
# Construir el proyecto
npm run build

# Poblar con datos de ejemplo
npm run seed
```

### 5. Iniciar servidor de desarrollo
```powershell
npm run dev
```
Servidor disponible en: http://localhost:9000

## Configuración del Frontend (Storefront)

### 1. Navegar al directorio del frontend
```powershell
cd "c:\Users\Jesus\Downloads\VELVET\velvet-storefront"
```

### 2. Instalar dependencias
```powershell
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env.local`:

```bash
# URL del backend Medusa
MEDUSA_BACKEND_URL=http://localhost:9000

# Clave pública de Medusa (se obtiene del admin)
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=tu_publishable_key_aqui
```

### 4. Iniciar servidor de desarrollo
```powershell
npm run dev
```
Storefront disponible en: http://localhost:8000

## Configuración del Admin Panel

El admin panel de Medusa está integrado y disponible en:
http://localhost:9000/app

## Orden de Inicio

1. **Primero:** Asegúrate de que PostgreSQL y Redis estén ejecutándose
2. **Segundo:** Inicia el backend de Medusa (`npm run dev` en `/velvet`)
3. **Tercero:** Inicia el storefront (`npm run dev` en `/velvet-storefront`)

## Verificación

- Backend API: http://localhost:9000/health
- Admin Panel: http://localhost:9000/app
- Storefront: http://localhost:8000

## Troubleshooting

### Error de conexión a la base de datos
- Verificar que PostgreSQL esté ejecutándose
- Verificar credenciales en DATABASE_URL
- Verificar que la base de datos `medusa-v2` exista

### Error de conexión a Redis
- Verificar que Redis esté ejecutándose en puerto 6379
- En Windows, puede necesitar instalar Redis for Windows

### Puerto en uso
- Cambiar puertos en los scripts si están ocupados
- Backend: modificar en `medusa-config.ts`
- Frontend: usar `-p PUERTO` en el comando npm run dev

## Scripts Útiles

### Backend (velvet/)
- `npm run dev` - Desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar en producción
- `npm run seed` - Poblar base de datos

### Frontend (velvet-storefront/)
- `npm run dev` - Desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar en producción
- `npm run lint` - Verificar código

- yap