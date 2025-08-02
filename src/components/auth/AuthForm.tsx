'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getUserRole, getRedirectUrl, debugUserRole } from '@/utils/roleUtils';
import Link from 'next/link';

/**
 * Componente de autenticación que combina login y registro
 * Integrado con Supabase para manejo de usuarios
 */

interface AuthFormProps {
  readonly mode?: 'login' | 'register';
  readonly redirectTo?: string;
  readonly onClose?: () => void;
}

export default function AuthForm({ mode = 'login', redirectTo = '/', onClose }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp, error, clearError } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      return 'Por favor, completa todos los campos requeridos';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Por favor, ingresa un correo electrónico válido';
    }

    if (formData.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!isLogin) {
      if (!formData.firstName || !formData.lastName) {
        return 'Por favor, completa tu nombre y apellido';
      }

      if (formData.password !== formData.confirmPassword) {
        return 'Las contraseñas no coinciden';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      let result;

      if (isLogin) {
        result = await signIn({
          email: formData.email,
          password: formData.password,
        });
      } else {
        result = await signUp({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        });
      }

      if (result.success && result.user) {
        // Si el login es exitoso, verificar el rol del usuario para redirección
        if (isLogin && result.user) {
          try {
            // Esperar un poco para asegurar que la sesión esté completamente establecida
            await new Promise(resolve => setTimeout(resolve, 500));
            
            console.log('Verificando rol para usuario:', result.user.id);
            
            // Usar la función de utilidad mejorada
            const userProfile = await getUserRole(result.user.id);
            
            if (!userProfile) {
              console.error('No se pudo obtener el perfil del usuario');
              // Debug del problema
              await debugUserRole(result.user.id);
              // Fallback a dashboard de usuario
              router.push('/user/dashboard');
              return;
            }

            console.log('Perfil obtenido:', userProfile);
            
            // Usar la función de utilidad para obtener la URL correcta
            const redirectUrl = getRedirectUrl(userProfile.role, '/user/dashboard');
            
            console.log('Redirigiendo a:', redirectUrl);
            router.push(redirectUrl);
            
          } catch (error) {
            console.error('Error verificando rol:', error);
            // En caso de error, usar redirección por defecto
            router.push('/user/dashboard');
          }
        } else if (!isLogin) {
          // Para registro exitoso, mostrar mensaje de éxito
          alert('¡Cuenta creada exitosamente! Revisa tu correo para confirmar tu cuenta.');
          // Redirigir al login para que el usuario inicie sesión
          setIsLogin(true);
          setFormData({
            email: formData.email, // Mantener el email
            password: '',
            firstName: '',
            lastName: '',
            phone: '',
            confirmPassword: '',
          });
        }

        if (onClose && isLogin) {
          onClose();
        }
      } else if (!result.success) {
        // Manejar errores específicos
        console.error('Error en autenticación:', result.error);
      }
    } catch (err) {
      console.error('Error inesperado en autenticación:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubmitButtonText = () => {
    if (isSubmitting) {
      return isLogin ? 'Iniciando sesión...' : 'Creando cuenta...';
    }
    return isLogin ? 'Iniciar sesión' : 'Crear cuenta';
  };

  const renderSubmitButton = () => {
    const buttonText = getSubmitButtonText();
    
    if (isSubmitting) {
      return (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          {buttonText}
        </div>
      );
    }
    
    return buttonText;
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      confirmPassword: '',
    });
    clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center bg-black rounded-lg">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? '¿No tienes una cuenta? ' : '¿Ya tienes una cuenta? '}
            <button
              type="button"
              onClick={toggleMode}
              className="font-medium text-black hover:text-gray-800 transition-colors"
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Campos de registro */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Nombre *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required={!isLogin}
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black text-gray-900 bg-white"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Apellido *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required={!isLogin}
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black text-gray-900 bg-white"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black text-gray-900 bg-white"
                placeholder="tu@ejemplo.com"
              />
            </div>

            {/* Teléfono (solo registro) */}
            {!isLogin && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black text-gray-900 bg-white"
                  placeholder="+52 (555) 123-4567"
                />
              </div>
            )}

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña *
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black text-gray-900 bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña (solo registro) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar contraseña *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required={!isLogin}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black text-gray-900 bg-white"
                  placeholder="••••••••"
                />
              </div>
            )}
          </div>

          {/* Botón de envío */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {renderSubmitButton()}
            </button>
          </div>

          {/* Links adicionales */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/" className="font-medium text-gray-600 hover:text-black transition-colors">
                ← Volver a la tienda
              </Link>
            </div>
            {isLogin && (
              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-black hover:text-gray-800 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
