import { render, screen, waitFor } from '@testing-library/react';
import UserDashboard from '@/app/user/dashboard/page';

// Mock del hook useAuth
const mockUseAuth = jest.fn();
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock de next/link
jest.mock('next/link', () => {
  return function MockLink({ href, children, className }: any) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

describe('UserDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when loading is true', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: true,
    });

    render(<UserDashboard />);

    // Verificar que se muestra el estado de carga
    const loadingDiv = screen.getByText((content, element) => {
      return element?.className?.includes('min-h-screen flex items-center justify-center') || false;
    });
    expect(loadingDiv).toBeInTheDocument();
    
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', async () => {
    const { redirect } = require('next/navigation');
    
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
    });

    render(<UserDashboard />);

    await waitFor(() => {
      expect(redirect).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('renders dashboard for authenticated user with first name', () => {
    const mockUser = {
      email: 'test@example.com',
      user_metadata: {
        first_name: 'Juan',
      },
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
    });

    render(<UserDashboard />);

    expect(screen.getByText('Bienvenido, Juan')).toBeInTheDocument();
    expect(screen.getByText('Gestiona tu cuenta y revisa tus pedidos desde aquí')).toBeInTheDocument();
  });

  it('renders dashboard for authenticated user with email fallback', () => {
    const mockUser = {
      email: 'test@example.com',
      user_metadata: {},
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
    });

    render(<UserDashboard />);

    expect(screen.getByText('Bienvenido, test@example.com')).toBeInTheDocument();
  });

  it('renders all stats cards with correct information', () => {
    const mockUser = {
      email: 'test@example.com',
      user_metadata: { first_name: 'Juan' },
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
    });

    render(<UserDashboard />);

    // Verificar las tarjetas de estadísticas
    expect(screen.getByText('Pedidos Totales')).toBeInTheDocument();
    expect(screen.getByText('Total Gastado')).toBeInTheDocument();
    expect(screen.getByText('Favoritos')).toBeInTheDocument();

    // Verificar los valores iniciales
    expect(screen.getByText('$0.00')).toBeInTheDocument();
    // Hay dos elementos con "0" (pedidos y favoritos)
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements).toHaveLength(2);
  });

  it('renders account management section with all links', () => {
    const mockUser = {
      email: 'test@example.com',
      user_metadata: { first_name: 'Juan' },
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
    });

    render(<UserDashboard />);

    expect(screen.getByText('Gestión de Cuenta')).toBeInTheDocument();

    // Verificar los enlaces de gestión de cuenta
    expect(screen.getByText('Mi Perfil')).toBeInTheDocument();
    expect(screen.getByText('Actualiza tu información personal')).toBeInTheDocument();

    expect(screen.getByText('Direcciones')).toBeInTheDocument();
    expect(screen.getByText('Gestiona tus direcciones de envío')).toBeInTheDocument();

    expect(screen.getByText('Métodos de Pago')).toBeInTheDocument();
    expect(screen.getByText('Administra tus tarjetas y métodos')).toBeInTheDocument();
  });

  it('renders order history section with empty state', () => {
    const mockUser = {
      email: 'test@example.com',
      user_metadata: { first_name: 'Juan' },
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
    });

    render(<UserDashboard />);

    expect(screen.getByText('Historial de Pedidos')).toBeInTheDocument();
    expect(screen.getByText('No tienes pedidos aún')).toBeInTheDocument();
    expect(screen.getByText('Explora nuestra tienda y realiza tu primera compra')).toBeInTheDocument();
    expect(screen.getByText('Explorar Tienda')).toBeInTheDocument();
  });

  it('renders recent activity section with empty state', () => {
    const mockUser = {
      email: 'test@example.com',
      user_metadata: { first_name: 'Juan' },
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
    });

    render(<UserDashboard />);

    expect(screen.getByText('Actividad Reciente')).toBeInTheDocument();
    expect(screen.getByText('No hay actividad reciente para mostrar')).toBeInTheDocument();
  });

  it('has correct navigation links with proper hrefs', () => {
    const mockUser = {
      email: 'test@example.com',
      user_metadata: { first_name: 'Juan' },
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
    });

    render(<UserDashboard />);

    // Verificar que los enlaces tienen los href correctos
    expect(screen.getByRole('link', { name: /mi perfil/i })).toHaveAttribute('href', '/user/profile');
    expect(screen.getByRole('link', { name: /direcciones/i })).toHaveAttribute('href', '/user/addresses');
    expect(screen.getByRole('link', { name: /métodos de pago/i })).toHaveAttribute('href', '/user/payment-methods');
    expect(screen.getByRole('link', { name: /explorar tienda/i })).toHaveAttribute('href', '/shop');
  });

  it('renders all SVG icons correctly', () => {
    const mockUser = {
      email: 'test@example.com',
      user_metadata: { first_name: 'Juan' },
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
    });

    render(<UserDashboard />);

    // Verificar que hay múltiples SVGs en la página
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(5); // Iconos en stats + navigation icons
  });

  it('handles user without user_metadata gracefully', () => {
    const mockUser = {
      email: 'test@example.com',
      // No user_metadata property
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
    });

    render(<UserDashboard />);

    expect(screen.getByText('Bienvenido, test@example.com')).toBeInTheDocument();
  });

  it('has proper responsive grid classes', () => {
    const mockUser = {
      email: 'test@example.com',
      user_metadata: { first_name: 'Juan' },
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
    });

    render(<UserDashboard />);

    // Verificar clases de grid responsivo
    const statsGrid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
    expect(statsGrid).toBeInTheDocument();

    const mainGrid = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
    expect(mainGrid).toBeInTheDocument();
  });
});
