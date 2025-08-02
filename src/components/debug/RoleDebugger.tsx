'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { debugUserRole } from '@/utils/roleUtils';

/**
 * Componente temporal para debuggear problemas de roles
 * Agrégalo temporalmente a tu página de admin para diagnosticar
 */
export default function RoleDebugger() {
  const { user, isAuthenticated } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    if (!user) {
      setDebugInfo('No hay usuario autenticado');
      return;
    }

    setLoading(true);
    setDebugInfo('Ejecutando diagnóstico...\n\n');

    try {
      // Obtener información básica
      let info = `=== INFORMACIÓN DE USUARIO ===\n`;
      info += `ID: ${user.id}\n`;
      info += `Email: ${user.email}\n`;
      info += `Autenticado: ${isAuthenticated}\n\n`;

      // Verificar sesión
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      info += `=== SESIÓN ===\n`;
      info += `Sesión válida: ${!!session.session}\n`;
      info += `Error de sesión: ${sessionError?.message || 'Ninguno'}\n\n`;

      // Intentar obtener perfil
      info += `=== PERFIL DE USUARIO ===\n`;
      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          info += `Error obteniendo perfil: ${profileError.message}\n`;
          info += `Código de error: ${profileError.code}\n`;
          info += `Detalles: ${profileError.details}\n`;
        } else {
          info += `Rol: ${profile.role}\n`;
          info += `Nombre: ${profile.first_name} ${profile.last_name}\n`;
          info += `Email en perfil: ${profile.email}\n`;
          info += `Creado: ${profile.created_at}\n`;
        }
      } catch (err) {
        info += `Error inesperado: ${err}\n`;
      }

      // Verificar políticas RLS
      info += `\n=== POLÍTICAS RLS ===\n`;
      try {
        const { data: policies, error: policiesError } = await supabase
          .from('pg_policies')
          .select('*')
          .eq('tablename', 'user_profiles');

        if (policiesError) {
          info += `Error obteniendo políticas: ${policiesError.message}\n`;
        } else {
          info += `Políticas encontradas: ${policies?.length || 0}\n`;
          policies?.forEach(policy => {
            info += `- ${policy.policyname}: ${policy.cmd}\n`;
          });
        }
      } catch (err) {
        info += `Error verificando políticas: ${err}\n`;
      }

      setDebugInfo(info);

      // También ejecutar el debugger detallado
      console.log('Ejecutando debug detallado...');
      await debugUserRole(user.id);

    } catch (error) {
      setDebugInfo(`Error durante diagnóstico: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const makeUserAdmin = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: 'admin' })
        .eq('id', user.id);

      if (error) {
        setDebugInfo(prev => prev + `\n\nError haciendo admin: ${error.message}`);
      } else {
        setDebugInfo(prev => prev + '\n\n✅ Usuario promovido a admin exitosamente!');
      }
    } catch (error) {
      setDebugInfo(prev => prev + `\n\nError inesperado: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p>No estás autenticado. Inicia sesión primero.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 border rounded-lg">
      <h3 className="text-lg font-bold mb-4">🔍 Debug de Roles</h3>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={runDiagnostic}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Ejecutando...' : 'Ejecutar Diagnóstico'}
          </button>
        </div>

        <div>
          <button
            onClick={makeUserAdmin}
            disabled={loading}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            🚨 Hacer Admin (Solo para testing)
          </button>
        </div>

        {debugInfo && (
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
            {debugInfo}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Nota:</strong> Este componente es solo para debugging. Remuévelo en producción.</p>
        <p>Revisa también la consola del navegador para logs adicionales.</p>
      </div>
    </div>
  );
}
