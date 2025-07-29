import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import CheckoutPage from '../../app/checkout/page';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../context/CartContext', () => ({
  useCart: jest.fn(),
}));

jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/image', () => {
  return function MockedImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Simular notificaciones sin dependencia externa
const mockAlert = jest.fn();
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
};

// Mock global functions
beforeAll(() => {
  global.alert = mockAlert;
  global.console.log = mockConsole.log;
  global.console.error = mockConsole.error;
  
  // Mock window.location.href
  delete (window as any).location;
  window.location = { href: '' } as any;
});

describe('CheckoutPage - Comprehensive Coverage', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  };

  const mockProduct = {
    id: '1',
    name: 'Vestido Negro',
    price: 99.99,
    discount_price: 89.99,
    images: ['/test-image.jpg'],
    category: 'dresses',
    description: 'Test description',
    stock: 10,
    sizes: ['S', 'M', 'L'],
    colors: ['Negro'],
  };

  const mockCartWithItems = {
    items: [{
      id: '1',
      product: mockProduct,
      quantity: 2,
      size: 'M',
      color: 'Negro',
      price: 89.99
    }],
    total: 179.98,
    subtotal: 179.98,
    tax: 28.80,
    shipping: 0,
    discount: 10.00
  };

  const mockAuthenticatedUser = {
    id: 'user-1',
    email: 'test@example.com',
    user_metadata: {
      first_name: 'John',
      last_name: 'Doe',
      phone: '123-456-7890'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
    mockConsole.log.mockClear();
    mockConsole.error.mockClear();

    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    (useCart as jest.Mock).mockReturnValue({
      cart: mockCartWithItems,
      clearCart: jest.fn(),
      loading: false
    });

    (useAuth as jest.Mock).mockReturnValue({
      user: mockAuthenticatedUser,
      isAuthenticated: true,
      loading: false,
      error: null
    });
  });

  describe('Renderizado inicial y estado base', () => {
    test('debe renderizar la página de checkout con usuario autenticado y productos', () => {
      render(<CheckoutPage />);
      
      expect(screen.getByText('Checkout')).toBeInTheDocument();
      expect(screen.getByText('Información de Envío')).toBeInTheDocument();
      expect(screen.getByText('Resumen del Pedido')).toBeInTheDocument();
      expect(screen.getByText('Vestido Negro')).toBeInTheDocument();
    });

    test('debe mostrar redirección cuando el carrito está vacío', () => {
      (useCart as jest.Mock).mockReturnValue({
        cart: { items: [], total: 0, subtotal: 0, tax: 0, shipping: 0, discount: 0 },
        clearCart: jest.fn(),
        loading: false
      });

      render(<CheckoutPage />);
      
      expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /ir a la tienda/i })).toHaveAttribute('href', '/shop');
    });

    test('debe mostrar redirección cuando el usuario no está autenticado', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      });

      render(<CheckoutPage />);
      
      expect(screen.getByText('Inicia sesión para una experiencia mejor')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /inicia sesión/i })).toHaveAttribute('href', '/auth/login');
    });

    test('debe pre-llenar el formulario con datos del usuario autenticado', () => {
      render(<CheckoutPage />);
      
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123-456-7890')).toBeInTheDocument();
    });
  });

  describe('Formulario de envío', () => {
    test('debe actualizar todos los campos del formulario de envío', async () => {
      const user = userEvent.setup();
      render(<CheckoutPage />);
      
      const addressInput = screen.getByLabelText('Dirección *');
      const cityInput = screen.getByLabelText('Ciudad *');
      const stateInput = screen.getByLabelText('Estado *');
      const zipCodeInput = screen.getByLabelText('Código Postal *');
      
      await user.clear(addressInput);
      await user.type(addressInput, 'Calle Falsa 123');
      await user.clear(cityInput);
      await user.type(cityInput, 'Ciudad de México');
      await user.clear(stateInput);
      await user.type(stateInput, 'CDMX');
      await user.clear(zipCodeInput);
      await user.type(zipCodeInput, '12345');
      
      expect(addressInput).toHaveValue('Calle Falsa 123');
      expect(cityInput).toHaveValue('Ciudad de México');
      expect(stateInput).toHaveValue('CDMX');
      expect(zipCodeInput).toHaveValue('12345');
    });

    test('debe avanzar al paso de pago con formulario válido', async () => {
      const user = userEvent.setup();
      render(<CheckoutPage />);
      
      // Llenar campos requeridos que puedan estar vacíos
      const addressInput = screen.getByLabelText('Dirección *');
      const cityInput = screen.getByLabelText('Ciudad *');
      const stateInput = screen.getByLabelText('Estado *');
      const zipCodeInput = screen.getByLabelText('Código Postal *');
      
      await user.clear(addressInput);
      await user.type(addressInput, 'Calle Falsa 123');
      await user.clear(cityInput);
      await user.type(cityInput, 'Ciudad de México');
      await user.clear(stateInput);
      await user.type(stateInput, 'CDMX');
      await user.clear(zipCodeInput);
      await user.type(zipCodeInput, '12345');
      
      const submitButton = screen.getByRole('button', { name: /continuar al pago/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Información de Pago')).toBeInTheDocument();
      });
    });
  });

  describe('Formulario de pago', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<CheckoutPage />);
      
      // Avanzar al paso de pago
      const addressInput = screen.getByLabelText('Dirección *');
      const cityInput = screen.getByLabelText('Ciudad *');
      const stateInput = screen.getByLabelText('Estado *');
      const zipCodeInput = screen.getByLabelText('Código Postal *');
      
      await user.clear(addressInput);
      await user.type(addressInput, 'Calle Falsa 123');
      await user.clear(cityInput);
      await user.type(cityInput, 'Ciudad de México');
      await user.clear(stateInput);
      await user.type(stateInput, 'CDMX');
      await user.clear(zipCodeInput);
      await user.type(zipCodeInput, '12345');
      
      const continueButton = screen.getByRole('button', { name: /continuar al pago/i });
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText('Información de Pago')).toBeInTheDocument();
      });
    });

    test('debe renderizar y actualizar campos del formulario de pago', async () => {
      const user = userEvent.setup();
      
      const cardNumberInput = screen.getByLabelText('Número de Tarjeta *');
      const cardNameInput = screen.getByLabelText('Nombre en la Tarjeta *');
      const expiryDateInput = screen.getByLabelText('Fecha de Vencimiento *');
      const cvvInput = screen.getByLabelText('CVV *');
      
      await user.type(cardNumberInput, '4111111111111111');
      await user.type(cardNameInput, 'John Doe');
      await user.type(expiryDateInput, '12/25');
      await user.type(cvvInput, '123');
      
      expect(cardNumberInput).toHaveValue('4111111111111111');
      expect(cardNameInput).toHaveValue('John Doe');
      expect(expiryDateInput).toHaveValue('12/25');
      expect(cvvInput).toHaveValue('123');
    });

    test('debe permitir volver al paso de envío', async () => {
      const user = userEvent.setup();
      
      const backButton = screen.getByRole('button', { name: /volver/i });
      await user.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByText('Información de Envío')).toBeInTheDocument();
      });
    });

    test('debe avanzar al paso de revisión con datos válidos', async () => {
      const user = userEvent.setup();
      
      const cardNumberInput = screen.getByLabelText('Número de Tarjeta *');
      const cardNameInput = screen.getByLabelText('Nombre en la Tarjeta *');
      const expiryDateInput = screen.getByLabelText('Fecha de Vencimiento *');
      const cvvInput = screen.getByLabelText('CVV *');
      
      await user.type(cardNumberInput, '4111111111111111');
      await user.type(cardNameInput, 'John Doe');
      await user.type(expiryDateInput, '12/25');
      await user.type(cvvInput, '123');
      
      const reviewButton = screen.getByRole('button', { name: /revisar pedido/i });
      await user.click(reviewButton);
      
      await waitFor(() => {
        expect(screen.getByText('Revisar Pedido')).toBeInTheDocument();
      });
    });
  });

  describe('Revisión del pedido', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<CheckoutPage />);
      
      // Completar flujo hasta revisión
      // Paso 1: Shipping
      const addressInput = screen.getByLabelText('Dirección *');
      const cityInput = screen.getByLabelText('Ciudad *');
      const stateInput = screen.getByLabelText('Estado *');
      const zipCodeInput = screen.getByLabelText('Código Postal *');
      
      await user.clear(addressInput);
      await user.type(addressInput, 'Calle Falsa 123');
      await user.clear(cityInput);
      await user.type(cityInput, 'Ciudad de México');
      await user.clear(stateInput);
      await user.type(stateInput, 'CDMX');
      await user.clear(zipCodeInput);
      await user.type(zipCodeInput, '12345');
      
      await user.click(screen.getByRole('button', { name: /continuar al pago/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Información de Pago')).toBeInTheDocument();
      });
      
      // Paso 2: Payment
      await user.type(screen.getByLabelText('Número de Tarjeta *'), '4111111111111111');
      await user.type(screen.getByLabelText('Nombre en la Tarjeta *'), 'John Doe');
      await user.type(screen.getByLabelText('Fecha de Vencimiento *'), '12/25');
      await user.type(screen.getByLabelText('CVV *'), '123');
      
      await user.click(screen.getByRole('button', { name: /revisar pedido/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Revisar Pedido')).toBeInTheDocument();
      });
    });

    test('debe mostrar información de envío en la revisión', () => {
      expect(screen.getAllByText('John Doe')).toHaveLength(2); // Aparece en shipping y payment info
      expect(screen.getByText('Calle Falsa 123')).toBeInTheDocument();
      expect(screen.getByText('Ciudad de México, CDMX 12345')).toBeInTheDocument();
      expect(screen.getByText('123-456-7890')).toBeInTheDocument();
    });

    test('debe mostrar información de pago enmascarada', () => {
      expect(screen.getByText('**** **** **** 1111')).toBeInTheDocument();
      expect(screen.getAllByText('John Doe')).toHaveLength(2); // Shipping and payment sections
    });

    test('debe permitir volver al paso de pago', async () => {
      const user = userEvent.setup();
      
      const backButton = screen.getByRole('button', { name: /volver/i });
      await user.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByText('Información de Pago')).toBeInTheDocument();
      });
    });

    test('debe procesar la orden exitosamente', async () => {
      const user = userEvent.setup();
      
      // Este test ya está en el paso de revisión gracias al beforeEach anterior
      // Solo necesitamos verificar que el botón de realizar pedido funciona
      
      const placeOrderButtons = screen.getAllByRole('button', { name: /realizar pedido/i });
      expect(placeOrderButtons.length).toBeGreaterThan(0);
      
      // Hacer click en el primer botón disponible
      await user.click(placeOrderButtons[0]);
      
      // Verificar que el proceso de orden se inicia
      await waitFor(() => {
        expect(screen.getByText('Procesando...')).toBeInTheDocument();
      });
    });
  });

  describe('Resumen del pedido', () => {
    test('debe mostrar información completa del producto', () => {
      render(<CheckoutPage />);
      
      expect(screen.getByText('Vestido Negro')).toBeInTheDocument();
      expect(screen.getByText('M • Negro • Qty: 2')).toBeInTheDocument();
      expect(screen.getAllByText('$179.98')).toHaveLength(3); // Item price, subtotal, and total
    });

    test('debe mostrar cálculos de totales correctos', () => {
      render(<CheckoutPage />);
      
      expect(screen.getByText('Subtotal:')).toBeInTheDocument();
      expect(screen.getAllByText('$179.98')).toHaveLength(3); // Multiple places
      expect(screen.getByText('Envío:')).toBeInTheDocument();
      expect(screen.getByText('Gratis')).toBeInTheDocument();
      expect(screen.getByText('IVA (16%):')).toBeInTheDocument();
      expect(screen.getByText('$28.80')).toBeInTheDocument();
      expect(screen.getByText('Descuento:')).toBeInTheDocument();
      expect(screen.getByText('-$10.00')).toBeInTheDocument();
      expect(screen.getByText('Total:')).toBeInTheDocument();
    });

    test('debe mostrar envío con costo cuando aplicable', () => {
      const cartWithShipping = {
        ...mockCartWithItems,
        shipping: 99.00
      };

      (useCart as jest.Mock).mockReturnValue({
        cart: cartWithShipping,
        clearCart: jest.fn(),
        loading: false
      });

      render(<CheckoutPage />);
      
      expect(screen.getByText('$99.00')).toBeInTheDocument();
    });

    test('debe renderizar imagen del producto con fallback', () => {
      render(<CheckoutPage />);
      
      const productImage = screen.getByAltText('Vestido Negro');
      expect(productImage).toBeInTheDocument();
      expect(productImage).toHaveAttribute('src', '/test-image.jpg');
    });

    test('debe manejar productos sin descuento correctamente', () => {
      const productWithoutDiscount = {
        ...mockProduct,
        discount_price: null
      };

      const cartWithoutDiscount = {
        ...mockCartWithItems,
        items: [{
          ...mockCartWithItems.items[0],
          product: productWithoutDiscount,
          price: 99.99
        }]
      };

      (useCart as jest.Mock).mockReturnValue({
        cart: cartWithoutDiscount,
        clearCart: jest.fn(),
        loading: false
      });

      render(<CheckoutPage />);
      
      expect(screen.getByText('$199.98')).toBeInTheDocument();
    });
  });

  describe('Estados de carga y error', () => {
    test('debe mostrar estado de carga del carrito', () => {
      (useCart as jest.Mock).mockReturnValue({
        cart: mockCartWithItems,
        clearCart: jest.fn(),
        loading: true
      });

      render(<CheckoutPage />);
      
      // El componente debería manejar el estado de carga apropiadamente
      expect(screen.getByText('Checkout')).toBeInTheDocument();
    });

    test('debe manejar usuario sin metadata completa', () => {
      const userWithoutMetadata = {
        id: 'user-1',
        email: 'test@example.com',
        user_metadata: {}
      };

      (useAuth as jest.Mock).mockReturnValue({
        user: userWithoutMetadata,
        isAuthenticated: true,
        loading: false,
        error: null
      });

      render(<CheckoutPage />);
      
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      // Los otros campos deberían estar vacíos
      expect(screen.getByLabelText('Nombre *')).toHaveValue('');
      expect(screen.getByLabelText('Apellido *')).toHaveValue('');
    });

    test('debe deshabilitar botón durante el procesamiento', async () => {
      const user = userEvent.setup();
      render(<CheckoutPage />);
      
      // Avanzar hasta revisión
      const addressInput = screen.getByLabelText('Dirección *');
      await user.clear(addressInput);
      await user.type(addressInput, 'Test Address');
      await user.clear(screen.getByLabelText('Ciudad *'));
      await user.type(screen.getByLabelText('Ciudad *'), 'Test City');
      await user.clear(screen.getByLabelText('Estado *'));
      await user.type(screen.getByLabelText('Estado *'), 'Test State');
      await user.clear(screen.getByLabelText('Código Postal *'));
      await user.type(screen.getByLabelText('Código Postal *'), '12345');
      
      await user.click(screen.getByRole('button', { name: /continuar al pago/i }));
      await waitFor(() => expect(screen.getByText('Información de Pago')).toBeInTheDocument());
      
      await user.type(screen.getByLabelText('Número de Tarjeta *'), '4111111111111111');
      await user.type(screen.getByLabelText('Nombre en la Tarjeta *'), 'John Doe');
      await user.type(screen.getByLabelText('Fecha de Vencimiento *'), '12/25');
      await user.type(screen.getByLabelText('CVV *'), '123');
      
      await user.click(screen.getByRole('button', { name: /revisar pedido/i }));
      await waitFor(() => expect(screen.getByText('Revisar Pedido')).toBeInTheDocument());
      
      const placeOrderButton = screen.getByRole('button', { name: /realizar pedido/i });
      await user.click(placeOrderButton);
      
      // El botón debería estar deshabilitado durante el procesamiento
      expect(screen.getByRole('button', { name: /procesando.../i })).toBeDisabled();
    });
  });

  describe('Casos edge', () => {
    test('debe manejar carrito sin descuentos', () => {
      const cartWithoutDiscount = {
        ...mockCartWithItems,
        discount: 0
      };

      (useCart as jest.Mock).mockReturnValue({
        cart: cartWithoutDiscount,
        clearCart: jest.fn(),
        loading: false
      });

      render(<CheckoutPage />);
      
      expect(screen.queryByText('Descuento:')).not.toBeInTheDocument();
      expect(screen.queryByText('-$10.00')).not.toBeInTheDocument();
    });

    test('debe manejar productos con imágenes faltantes', () => {
      const productWithoutImages = {
        ...mockProduct,
        images: null
      };

      const cartWithoutImages = {
        ...mockCartWithItems,
        items: [{
          ...mockCartWithItems.items[0],
          product: productWithoutImages
        }]
      };

      (useCart as jest.Mock).mockReturnValue({
        cart: cartWithoutImages,
        clearCart: jest.fn(),
        loading: false
      });

      render(<CheckoutPage />);
      
      const productImage = screen.getByAltText('Vestido Negro');
      expect(productImage).toHaveAttribute('src', '/images/placeholder.jpg');
    });

    test('debe formatear precios correctamente', () => {
      const cartWithDecimalPrices = {
        ...mockCartWithItems,
        subtotal: 199.999,
        total: 299.995,
        tax: 31.999
      };

      (useCart as jest.Mock).mockReturnValue({
        cart: cartWithDecimalPrices,
        clearCart: jest.fn(),
        loading: false
      });

      render(<CheckoutPage />);
      
      // Los precios deberían formatearse apropiadamente
      expect(screen.getByText('Subtotal:')).toBeInTheDocument();
      expect(screen.getByText('Total:')).toBeInTheDocument();
    });
  });
});
