# VELVET - Tienda de Ropa Online

Una aplicación de comercio electrónico moderna y elegante desarrollada con Next.js 15, TypeScript y Tailwind CSS. VELVET es una tienda de moda premium que ofrece una experiencia de compra sofisticada y fácil de usar.

## 🚀 Características Principales

### 🛍️ Funcionalidades de E-commerce
- **Catálogo de productos** con filtros avanzados por categoría, precio, talla y color
- **Carrito de compras** persistente con localStorage
- **Páginas de producto individuales** con galería de imágenes y opciones de personalización
- **Sistema de búsqueda** con sugerencias automáticas
- **Productos destacados** y recomendaciones
- **Gestión de inventario** en tiempo real

### 🎨 Diseño y UX
- **Diseño responsive** optimizado para móvil, tablet y desktop
- **Interfaz moderna** con animaciones suaves y microinteracciones
- **Tema elegante** en escala de grises con acentos de color
- **Componentes reutilizables** construidos con Tailwind CSS
- **Navegación intuitiva** con breadcrumbs y menús contextuales

### 🛒 Carrito y Checkout
- **Carrito lateral (drawer)** para vista rápida
- **Página de carrito completa** con gestión de cantidades
- **Cálculo automático** de envío, impuestos y descuentos
- **Envío gratis** en compras mayores a $100 USD
- **Múltiples métodos de pago** (preparado para integración)

### 📱 Experiencia de Usuario
- **Búsqueda instantánea** con filtros inteligentes
- **Lista de deseos** (wishlist) para productos favoritos
- **Comparación de productos** por características
- **Reseñas y calificaciones** de usuarios
- **Notificaciones toast** para acciones del usuario

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15** - Framework de React con App Router
- **TypeScript** - Tipado estático para mayor robustez
- **Tailwind CSS** - Framework de utilidades CSS
- **React Hooks** - Para manejo de estado y efectos

### Estado y Contexto
- **React Context API** - Para manejo global del carrito
- **Custom Hooks** - Para lógica reutilizable de productos
- **localStorage** - Persistencia del carrito entre sesiones

### Base de Datos y Backend
- **Supabase** - Base de datos PostgreSQL en la nube
- **API Routes** - Endpoints internos de Next.js
- **Datos mockeados** - Para desarrollo y demostración

### Herramientas de Desarrollo
- **ESLint** - Linting de código
- **PostCSS** - Procesamiento de CSS
- **TypeScript compiler** - Verificación de tipos

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── cart/              # Página del carrito
│   ├── checkout/          # Proceso de checkout
│   ├── product/[id]/      # Páginas de productos individuales
│   ├── shop/              # Catálogo principal
│   └── user/              # Área de usuario
├── components/            # Componentes reutilizables
│   ├── cart/              # Componentes del carrito
│   ├── layout/            # Header, Footer, etc.
│   ├── product/           # Tarjetas y detalles de productos
│   └── ui/                # Componentes de interfaz básicos
├── context/               # Contextos de React
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades y configuraciones
├── styles/                # Estilos globales
└── types/                 # Definiciones de TypeScript
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm, yarn o pnpm

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/velvet.git
   cd velvet
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` con tus configuraciones:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   # o
   pnpm dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🛍️ Funcionalidades Implementadas

### ✅ Completado
- [x] Página de inicio con hero section
- [x] Catálogo de productos con filtros
- [x] Páginas de producto individuales
- [x] Carrito de compras funcional
- [x] Sistema de búsqueda
- [x] Navegación responsive
- [x] Componentes reutilizables
- [x] Gestión de estado con Context API
- [x] Datos mockeados para demostración

### 🚧 En Desarrollo
- [ ] Integración con Supabase
- [ ] Sistema de autenticación
- [ ] Proceso de checkout completo
- [ ] Pasarela de pagos (Stripe/MercadoPago)
- [ ] Panel de administración
- [ ] Sistema de reseñas
- [ ] Lista de deseos persistente

### 📋 Próximas Funcionalidades
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] PWA (Progressive Web App)
- [ ] Comparación de productos
- [ ] Historial de pedidos
- [ ] Sistema de descuentos y cupones
- [ ] Chat de soporte al cliente

## 💳 Integración de Pagos

El proyecto está preparado para integrar múltiples pasarelas de pago:

- **Stripe** - Para pagos internacionales
- **MercadoPago** - Para el mercado latinoamericano
- **PayPal** - Opción adicional
- **Transferencias bancarias** - Para pagos locales

## 📱 Responsive Design

La aplicación está optimizada para todos los dispositivos:

- **Mobile First** - Diseño comenzando por móviles
- **Breakpoints Tailwind** - sm, md, lg, xl, 2xl
- **Touch-friendly** - Botones y elementos adaptados para touch
- **Performance optimizada** - Carga rápida en dispositivos móviles

## 🔧 Configuración de Desarrollo

### Scripts Disponibles

```bash
npm run dev      # Ejecuta en modo desarrollo
npm run build    # Construye para producción
npm run start    # Ejecuta en modo producción
npm run lint     # Ejecuta ESLint
```

### Configuración de ESLint

El proyecto incluye configuración de ESLint para:
- Reglas de React y React Hooks
- Reglas de TypeScript
- Reglas de Next.js
- Reglas de accesibilidad

### Estructura de Componentes

Los componentes siguen estas convenciones:
- **Props interfaces** definidas con TypeScript
- **Documentación JSDoc** para funciones principales
- **Exports nombrados** para componentes reutilizables
- **Separación de concerns** entre lógica y presentación

## 🎯 Objetivos del Proyecto

Este proyecto fue desarrollado como un mockup funcional para demostrar:

1. **Arquitectura moderna** de e-commerce con React/Next.js
2. **Mejores prácticas** en desarrollo frontend
3. **Diseño UX/UI** enfocado en conversión
4. **Código escalable** y mantenible
5. **Preparación para producción** con integraciones reales

## 📞 Soporte y Contacto

- **Email**: contacto@velvet.com
- **Teléfono**: +52 55 1234 5678
- **Documentación**: [Docs del proyecto]
- **Issues**: [GitHub Issues]

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**VELVET** - Donde la elegancia se encuentra con la tecnología 🖤
