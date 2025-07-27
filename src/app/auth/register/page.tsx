import AuthForm from '@/components/auth/AuthForm';

/**
 * Página de registro de nuevos usuarios
 */

export default function RegisterPage() {
  return <AuthForm mode="register" redirectTo="/user/dashboard" />;
}
