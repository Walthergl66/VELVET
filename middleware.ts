import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Rutas que requieren autenticación de admin
  const adminRoutes = ['/admin'];
  
  const isAdminRoute = adminRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  // Para rutas de admin, verificamos la autenticación en el cliente
  if (isAdminRoute) {
    // El middleware básico aquí solo verifica la ruta
    // La verificación real del rol se hace en el componente AdminLayout
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
};