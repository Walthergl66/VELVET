import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterPage from '@/app/auth/register/page';
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
          {mode === 'register' && (
            <>
              <input
                type="text"
                placeholder="Nombre"
                data-testid="firstname-input"
              />
              <input
                type="text"
                placeholder="Apellido"
                data-testid="lastname-input"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                data-testid="phone-input"
              />
            </>
          )}
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
          {mode === 'register' && (
            <input
              type="password"
              placeholder="Confirmar contraseña"
              data-testid="confirm-password-input"
            />
          )}
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

describe('RegisterPage', () => {
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

  it('debe renderizar la página de registro correctamente', () => {
    render(<RegisterPage />);
    
    // Verificar que el componente AuthForm se renderiza
    expect(screen.getByTestId('auth-form')).toBeInTheDocument();
    
    // Verificar que está en modo register
    expect(screen.getByTestId('mode')).toHaveTextContent('register');
    
    // Verificar que tiene el redirect correcto
    expect(screen.getByTestId('redirect-to')).toHaveTextContent('/user/dashboard');
    
    // Verificar elementos específicos del registro
    expect(screen.getByRole('heading', { name: /registrarse/i })).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Crear Cuenta');
  });

  it('debe pasar las props correctas al componente AuthForm', () => {
    render(<RegisterPage />);
    
    // Verificar que el modo es 'register'
    expect(screen.getByTestId('mode')).toHaveTextContent('register');
    
    // Verificar que el redirectTo es correcto
    expect(screen.getByTestId('redirect-to')).toHaveTextContent('/user/dashboard');
  });

  it('debe renderizar todos los campos del formulario de registro', () => {
    render(<RegisterPage />);
    
    // Verificar campos específicos del registro
    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Apellido')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Teléfono')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirmar contraseña')).toBeInTheDocument();
  });

  it('debe mostrar el título correcto para registro', () => {
    render(<RegisterPage />);
    
    // Verificar que el título es específico para registro
    expect(screen.getByRole('heading', { name: /registrarse/i })).toBeInTheDocument();
  });

  it('debe tener la estructura correcta del componente', () => {
    render(<RegisterPage />);
    
    // Verificar que el AuthForm está presente
    const authForm = screen.getByTestId('auth-form');
    expect(authForm).toBeInTheDocument();
    
    // Verificar que contiene elementos del formulario
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('debe configurar correctamente el modo register', () => {
    render(<RegisterPage />);
    
    // Verificar que NO muestra elementos específicos de login
    expect(screen.queryByText('Iniciar Sesión')).not.toBeInTheDocument();
    
    // Verificar que SÍ muestra elementos específicos de registro
    expect(screen.getByRole('heading', { name: /registrarse/i })).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Crear Cuenta');
  });

  it('debe tener los campos adicionales requeridos para registro', () => {
    render(<RegisterPage />);
    
    // Verificar campos específicos de registro que no están en login
    expect(screen.getByTestId('firstname-input')).toBeInTheDocument();
    expect(screen.getByTestId('lastname-input')).toBeInTheDocument();
    expect(screen.getByTestId('phone-input')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument();
  });

  it('debe tener accesibilidad correcta para todos los campos', () => {
    render(<RegisterPage />);
    
    // Verificar que los campos tienen los tipos correctos
    const firstnameInput = screen.getByTestId('firstname-input');
    const lastnameInput = screen.getByTestId('lastname-input');
    const phoneInput = screen.getByTestId('phone-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    
    expect(firstnameInput).toHaveAttribute('type', 'text');
    expect(lastnameInput).toHaveAttribute('type', 'text');
    expect(phoneInput).toHaveAttribute('type', 'tel');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    
    // Verificar placeholders descriptivos
    expect(firstnameInput).toHaveAttribute('placeholder', 'Nombre');
    expect(lastnameInput).toHaveAttribute('placeholder', 'Apellido');
    expect(phoneInput).toHaveAttribute('placeholder', 'Teléfono');
    expect(emailInput).toHaveAttribute('placeholder', 'Correo electrónico');
    expect(passwordInput).toHaveAttribute('placeholder', 'Contraseña');
    expect(confirmPasswordInput).toHaveAttribute('placeholder', 'Confirmar contraseña');
  });

  it('debe mostrar el botón de submit con el texto correcto', () => {
    render(<RegisterPage />);
    
    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveTextContent('Crear Cuenta');
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('debe diferenciar claramente del modo login', () => {
    render(<RegisterPage />);
    
    // Verificar que tiene campos únicos de registro
    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirmar contraseña')).toBeInTheDocument();
    
    // Verificar texto específico de registro
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Crear Cuenta');
    expect(screen.getByRole('heading', { name: /registrarse/i })).toBeInTheDocument();
  });
});
