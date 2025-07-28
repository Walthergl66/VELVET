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

      // Si el registro fue exitoso, crear perfil de usuario
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            first_name: firstName,
            last_name: lastName,
            phone: phone || null,
          });

        if (profileError) {
          console.error('Error al crear perfil:', profileError);
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
        .from('users')
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
    clearError,
  };
}
