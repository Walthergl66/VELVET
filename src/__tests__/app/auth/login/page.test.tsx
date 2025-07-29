import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '@/app/auth/login/page';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

// Mock de hooks
jest.mock('@/hooks/useAuth');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock del componente AuthForm
jest.mock('@/components/auth/AuthForm', () => {
  return function MockAuthForm({ mode, redirectTo }: { mode: string; redirectTo: string }) {
    return (
      <div data-testid="auth-form">
        <h1>{mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}</h1>
        <form>
          <input
            type="email"
            placeholder="Correo electrónico"
            data-testid="email-input"
          />
          <input
            type="password"
            placeholder="Contraseña"
            data-testid="password-input"
          />
          <button type="submit" data-testid="submit-button">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>
        </form>
        <div data-testid="redirect-to">{redirectTo}</div>
        <div data-testid="mode">{mode}</div>
      </div>
    );
  };
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('LoginPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (mockUseRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    });

    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
      updateProfile: jest.fn(),
      clearError: jest.fn(),
    });
  });

  it('debe renderizar la página de login correctamente', () => {
    render(<LoginPage />);
    
    // Verificar que el componente AuthForm se renderiza
    expect(screen.getByTestId('auth-form')).toBeInTheDocument();
    
    // Verificar que está en modo login
    expect(screen.getByTestId('mode')).toHaveTextContent('login');
    
    // Verificar que tiene el redirect correcto
    expect(screen.getByTestId('redirect-to')).toHaveTextContent('/user/dashboard');
    
    // Verificar elementos específicos del login
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Iniciar Sesión');
  });

  it('debe pasar las props correctas al componente AuthForm', () => {
    render(<LoginPage />);
    
    // Verificar que el modo es 'login'
    expect(screen.getByTestId('mode')).toHaveTextContent('login');
    
    // Verificar que el redirectTo es correcto
    expect(screen.getByTestId('redirect-to')).toHaveTextContent('/user/dashboard');
  });

  it('debe renderizar el formulario de inicio de sesión', () => {
    render(<LoginPage />);
    
    // Verificar que los campos del formulario están presentes
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    
    // Verificar que el botón de submit está presente con el texto correcto
    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveTextContent('Iniciar Sesión');
  });

  it('debe mostrar el título correcto para login', () => {
    render(<LoginPage />);
    
    // Verificar que el título es específico para login
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('debe tener la estructura correcta del componente', () => {
    render(<LoginPage />);
    
    // Verificar que el AuthForm está presente
    const authForm = screen.getByTestId('auth-form');
    expect(authForm).toBeInTheDocument();
    
    // Verificar que contiene elementos del formulario
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('debe configurar correctamente el modo login', () => {
    render(<LoginPage />);
    
    // Verificar que NO muestra elementos específicos de registro
    expect(screen.queryByText('Crear Cuenta')).not.toBeInTheDocument();
    
    // Verificar que SÍ muestra elementos específicos de login
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('debe tener accesibilidad correcta', () => {
    render(<LoginPage />);
    
    // Verificar que los campos tienen los tipos correctos
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Verificar que tienen placeholders descriptivos
    expect(emailInput).toHaveAttribute('placeholder', 'Correo electrónico');
    expect(passwordInput).toHaveAttribute('placeholder', 'Contraseña');
  });
});
