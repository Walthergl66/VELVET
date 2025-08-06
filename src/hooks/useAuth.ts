'use client';

import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/**
 * Hook personalizado para manejo de autenticación con Supabase
 * Proporciona funciones para login, registro, logout y estado del usuario
 */

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface SignInData {
  email: string;
  password: string;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Obtener sesión actual
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setState(prev => ({ ...prev, error: error.message, loading: false }));
        } else {
          setState(prev => ({
            ...prev,
            session,
            user: session?.user || null,
            loading: false,
            error: null,
          }));
        }
      } catch (err) {
        setState(prev => ({ 
          ...prev, 
          error: 'Error al obtener la sesión', 
          loading: false 
        }));
      }
    };

    getSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user || null,
          loading: false,
          error: null,
        }));

        // Eventos específicos
        if (event === 'SIGNED_IN') {
          console.log('Usuario autenticado:', session?.user?.email);
        } else if (event === 'SIGNED_OUT') {
          console.log('Usuario cerró sesión');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async ({ email, password, firstName, lastName, phone }: SignUpData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone || null,
          },
        },
      });

      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
        return { success: false, error: error.message };
      }

      // El perfil se crea automáticamente por el trigger handle_new_user
      // Solo registramos el evento de registro exitoso
      if (data.user) {
        console.log('Usuario registrado exitosamente:', data.user.email);
        
        // Esperar a que el trigger cree el perfil
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Solo verificar que el perfil fue creado (sin intentar crearlo)
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile) {
          console.warn('El perfil de usuario tardó en crearse, pero el registro fue exitoso');
        } else {
          console.log('Perfil de usuario creado correctamente');
        }
      }

      setState(prev => ({ 
        ...prev, 
        loading: false,
        session: data.session,
        user: data.user,
      }));

      return { success: true, user: data.user, session: data.session };
    } catch (err) {
      const errorMessage = 'Error inesperado durante el registro';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { success: false, error: errorMessage };
    }
  };

  const signIn = async ({ email, password }: SignInData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
        return { success: false, error: error.message };
      }

      setState(prev => ({ 
        ...prev, 
        loading: false,
        session: data.session,
        user: data.user,
      }));

      return { success: true, user: data.user, session: data.session };
    } catch (err) {
      const errorMessage = 'Error inesperado durante el inicio de sesión';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
        return { success: false, error: error.message };
      }

      setState(prev => ({
        ...prev,
        user: null,
        session: null,
        loading: false,
        error: null,
      }));

      return { success: true };
    } catch (err) {
      const errorMessage = 'Error inesperado durante el cierre de sesión';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
        return { success: false, error: error.message };
      }

      setState(prev => ({ ...prev, loading: false }));
      return { success: true };
    } catch (err) {
      const errorMessage = 'Error inesperado al enviar el correo de recuperación';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { success: false, error: errorMessage };
    }
  };

  const updateProfile = async (updates: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  }) => {
    if (!state.user) {
      return { success: false, error: 'No hay usuario autenticado' };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', state.user.id);

      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
        return { success: false, error: error.message };
      }

      setState(prev => ({ ...prev, loading: false }));
      return { success: true };
    } catch (err) {
      const errorMessage = 'Error inesperado al actualizar el perfil';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!state.user?.email) {
      return { success: false, error: 'No hay usuario autenticado' };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Verificar la contraseña actual re-autenticando al usuario
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: state.user.email,
        password: currentPassword
      });

      if (signInError) {
        setState(prev => ({ ...prev, error: 'La contraseña actual es incorrecta', loading: false }));
        return { success: false, error: 'La contraseña actual es incorrecta' };
      }

      // Actualizar la contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setState(prev => ({ ...prev, error: updateError.message, loading: false }));
        return { success: false, error: updateError.message };
      }

      setState(prev => ({ ...prev, loading: false }));
      return { success: true };
    } catch (err) {
      console.error('Error changing password:', err);
      const errorMessage = 'Error inesperado al cambiar la contraseña';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    // Estado
    user: state.user,
    session: state.session,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,

    // Acciones
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    changePassword,
    clearError,
  };
}
