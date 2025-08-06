import { supabase } from '@/lib/supabase';

/**
 * Utilidades para manejo de roles de usuario
 */

export interface UserRole {
  role: 'user' | 'admin';
  first_name: string;
  last_name: string;
  email: string;
}

/**
 * Obtiene el rol del usuario de manera robusta con reintentos
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    console.log('Obteniendo rol para usuario:', userId);
    
    // Primer intento
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role, first_name, last_name, email')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error en primer intento:', error);
      
      // Si es un error de RLS o no encontrado, reintentar
      if (error.code === 'PGRST116' || error.code === 'PGRST204') {
        console.log('Reintentando obtención de rol...');
        
        // Esperar un poco y reintentar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: retryData, error: retryError } = await supabase
          .from('user_profiles')
          .select('role, first_name, last_name, email')
          .eq('id', userId)
          .single();
          
        if (retryError) {
          console.error('Error en segundo intento:', retryError);
          return null;
        }
        
        console.log('Éxito en segundo intento:', retryData);
        return retryData;
      }
      
      return null;
    }

    console.log('Éxito en primer intento:', data);
    return data;
  } catch (error) {
    console.error('Error inesperado obteniendo rol:', error);
    return null;
  }
}

/**
 * Verifica si un usuario es administrador
 */
export function isAdmin(role: string | null | undefined): boolean {
  return role === 'admin';
}

/**
 * Verifica si un usuario es super administrador (mantenido por compatibilidad, siempre devuelve false)
 */
export function isSuperAdmin(role: string | null | undefined): boolean {
  return false; // Solo manejamos 'user' y 'admin'
}

/**
 * Obtiene la URL de redirección correcta basada en el rol
 */
export function getRedirectUrl(role: string | null | undefined, fallback: string = '/'): string {
  if (isAdmin(role)) {
    return '/admin';
  }
  
  if (role === 'user') {
    return '/user/dashboard';
  }
  
  return fallback;
}

/**
 * Función para debuggear roles - muestra información detallada
 */
export async function debugUserRole(userId: string): Promise<void> {
  console.log('=== DEBUG: Información de rol de usuario ===');
  console.log('User ID:', userId);
  
  try {
    // Verificar sesión actual
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('Sesión actual:', sessionData.session?.user?.id);
    console.log('Error de sesión:', sessionError);
    
    // Verificar perfil directamente
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId);
      
    console.log('Perfiles encontrados:', profile);
    console.log('Error de perfil:', profileError);
    
    // Verificar políticas RLS
    const { data: rlsTest, error: rlsError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    console.log('Test RLS:', rlsTest);
    console.log('Error RLS:', rlsError);
    
  } catch (error) {
    console.error('Error en debug:', error);
  }
  
  console.log('=== FIN DEBUG ===');
}
