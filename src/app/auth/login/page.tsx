import AuthForm from '@/components/auth/AuthForm';

/**
 * Página de inicio de sesión
 */

export default function LoginPage() {
  return <AuthForm mode="login" redirectTo="/user/dashboard" />;
}
