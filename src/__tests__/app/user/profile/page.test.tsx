import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserProfile from '@/app/user/profile/page';

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

describe('UserProfile', () => {
  const mockUpdateProfile = jest.fn();
  const mockUser = {
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
    user_metadata: {
      first_name: 'Juan',
      last_name: 'Pérez',
      phone: '+52 555 123 4567',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateProfile.mockClear();
  });

  it('renders loading state when loading is true', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: true,
      updateProfile: mockUpdateProfile,
    });

    render(<UserProfile />);

    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', async () => {
    const { redirect } = require('next/navigation');
    
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      updateProfile: mockUpdateProfile,
    });

    render(<UserProfile />);

    await waitFor(() => {
      expect(redirect).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('renders profile page for authenticated user', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      updateProfile: mockUpdateProfile,
    });

    render(<UserProfile />);

    expect(screen.getByText('Mi Perfil')).toBeInTheDocument();
    expect(screen.getByText('Gestiona tu información personal y preferencias de cuenta')).toBeInTheDocument();
  });

  it('displays user information correctly', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      updateProfile: mockUpdateProfile,
    });

    render(<UserProfile />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('Pérez')).toBeInTheDocument();
    expect(screen.getByText('+52 555 123 4567')).toBeInTheDocument();
  });

  it('displays member since date correctly', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      updateProfile: mockUpdateProfile,
    });

    render(<UserProfile />);

    expect(screen.getByText('31 de diciembre de 2023')).toBeInTheDocument();
  });

  it('enters edit mode when edit button is clicked', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      updateProfile: mockUpdateProfile,
    });

    render(<UserProfile />);

    const editButton = screen.getByText('Editar');
    fireEvent.click(editButton);

    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Guardar')).toBeInTheDocument();
  });

  it('allows editing form fields', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      updateProfile: mockUpdateProfile,
    });

    render(<UserProfile />);

    // Entrar en modo edición
    const editButton = screen.getByText('Editar');
    fireEvent.click(editButton);

    // Encontrar y modificar campos
    const firstNameInput = screen.getByDisplayValue('Juan');
    fireEvent.change(firstNameInput, { target: { value: 'Carlos' } });
    expect(firstNameInput).toHaveValue('Carlos');

    const lastNameInput = screen.getByDisplayValue('Pérez');
    fireEvent.change(lastNameInput, { target: { value: 'González' } });
    expect(lastNameInput).toHaveValue('González');

    const phoneInput = screen.getByDisplayValue('+52 555 123 4567');
    fireEvent.change(phoneInput, { target: { value: '+52 555 987 6543' } });
    expect(phoneInput).toHaveValue('+52 555 987 6543');
  });

  it('cancels editing and restores original data', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      updateProfile: mockUpdateProfile,
    });

    render(<UserProfile />);

    // Entrar en modo edición
    const editButton = screen.getByText('Editar');
    fireEvent.click(editButton);

    // Modificar un campo
    const firstNameInput = screen.getByDisplayValue('Juan');
    fireEvent.change(firstNameInput, { target: { value: 'Carlos' } });

    // Cancelar
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    // Verificar que se restauró el valor original y salió del modo edición
    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('Editar')).toBeInTheDocument();
  });

  it('saves profile changes successfully', async () => {
    mockUpdateProfile.mockResolvedValue({ success: true });
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      updateProfile: mockUpdateProfile,
    });

    render(<UserProfile />);

    // Entrar en modo edición
    const editButton = screen.getByText('Editar');
    fireEvent.click(editButton);

    // Modificar campos
    const firstNameInput = screen.getByDisplayValue('Juan');
    fireEvent.change(firstNameInput, { target: { value: 'Carlos' } });

    // Guardar
    const saveButton = screen.getByText('Guardar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        first_name: 'Carlos',
        last_name: 'Pérez',
        phone: '+52 555 123 4567',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Perfil actualizado correctamente')).toBeInTheDocument();
    });

    expect(screen.getByText('Editar')).toBeInTheDocument(); // Salió del modo edición
  });

  it('handles profile update error', async () => {
    mockUpdateProfile.mockResolvedValue({ 
      success: false, 
      error: 'Error de validación' 
    });
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      updateProfile: mockUpdateProfile,
    });

    render(<UserProfile />);

    // Entrar en modo edición y guardar
    fireEvent.click(screen.getByText('Editar'));
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(screen.getByText('Error de validación')).toBeInTheDocument();
    });
  });

  it('handles unexpected error during save', async () => {
    // Silenciar console.error para este test específico
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockUpdateProfile.mockRejectedValue(new Error('Network error'));
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      updateProfile: mockUpdateProfile,
    });

    render(<UserProfile />);

    // Entrar en modo edición y guardar
    fireEvent.click(screen.getByText('Editar'));
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(screen.getByText('Error inesperado al actualizar el perfil')).toBeInTheDocument();
    });

    // Restaurar console.error
    consoleSpy.mockRestore();
  });

  it('shows loading state while saving', async () => {
    // Mock que se resuelve después de un tiempo
    mockUpdateProfile.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      updateProfile: mockUpdateProfile,
    });

    render(<UserProfile />);

    // Entrar en modo edición y guardar
    fireEvent.click(screen.getByText('Editar'));
    fireEvent.click(screen.getByText('Guardar'));

    // Verificar estado de carga
    expect(screen.getByText('Guardando...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Perfil actualizado correctamente')).toBeInTheDocument();
    });
  });

  it('dismisses notification when close button is clicked', async () => {
    mockUpdateProfile.mockResolvedValue({ success: true });
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      updateProfile: mockUpdateProfile,
    });

    render(<UserProfile />);

    // Crear una notificación guardando
    fireEvent.click(screen.getByText('Editar'));
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(screen.getByText('Perfil actualizado correctamente')).toBeInTheDocument();
    });

    // Cerrar notificación usando el botón dentro de la notificación
    const notificationContainer = screen.getByText('Perfil actualizado correctamente').closest('div');
    const closeButton = notificationContainer?.querySelector('button');
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(screen.queryByText('Perfil actualizado correctamente')).not.toBeInTheDocument();
  });

  it('renders account settings section', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      updateProfile: mockUpdateProfile,
    });

    render(<UserProfile />);

    expect(screen.getByText('Configuración de Cuenta')).toBeInTheDocument();
    expect(screen.getByText('Cambiar Contraseña')).toBeInTheDocument();
    expect(screen.getByText('Notificaciones por Email')).toBeInTheDocument();
  });

  it('renders danger zone section', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      updateProfile: mockUpdateProfile,
    });

    render(<UserProfile />);

    expect(screen.getByText('Zona de Peligro')).toBeInTheDocument();
    expect(screen.getAllByText('Eliminar Cuenta')).toHaveLength(2); // heading y button
    expect(screen.getByText('Esta acción no se puede deshacer. Se eliminarán todos tus datos permanentemente.')).toBeInTheDocument();
  });

  it('handles user with no metadata gracefully', () => {
    const userWithoutMetadata = {
      email: 'test@example.com',
      created_at: '2024-01-01T00:00:00Z',
      user_metadata: null,
    };

    mockUseAuth.mockReturnValue({
      user: userWithoutMetadata,
      isAuthenticated: true,
      loading: false,
      updateProfile: mockUpdateProfile,
    });

    render(<UserProfile />);

    expect(screen.getAllByText('No especificado')).toHaveLength(3); // nombre, apellido, teléfono
  });

  it('has correct navigation links', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      updateProfile: mockUpdateProfile,
    });

    render(<UserProfile />);

    // Link de vuelta al dashboard (es un SVG icon)
    expect(screen.getByRole('link', { name: '' })).toHaveAttribute('href', '/user/dashboard');
    expect(screen.getByRole('link', { name: /cambiar contraseña/i })).toHaveAttribute('href', '/user/change-password');
  });
});
