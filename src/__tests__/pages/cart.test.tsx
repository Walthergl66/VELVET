import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import CartPage from '@/app/cart/page';

// Mock de Next.js
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock del hook useCart
jest.mock('@/context/CartContext', () => ({
  useCart: jest.fn(() => ({
    cart: {
      items: [
        {
          id: 1,
          name: 'Vestido Negro',
          price: 99.99,
          quantity: 2,
          image: '/images/vestido.jpg',
          size: 'M',
          color: 'Negro',
          product: {
            id: 1,
            name: 'Vestido Negro',
            images: ['/images/vestido.jpg']
          }
        },
        {
          id: 2,
          name: 'Blusa Blanca',
          price: 59.99,
          quantity: 1,
          image: '/images/blusa.jpg',
          size: 'S',
          color: 'Blanco',
          product: {
            id: 2,
            name: 'Blusa Blanca',
            images: ['/images/blusa.jpg']
          }
        }
      ],
      total: 259.97,
      itemsCount: 3
    },
    updateQuantity: jest.fn(),
    removeFromCart: jest.fn(),
    clearCart: jest.fn(),
    addToCart: jest.fn(),
    getItemCount: jest.fn(() => 3),
    getCartTotal: jest.fn(() => 259.97),
    getCartItemsCount: jest.fn(() => 3),
    loading: false,
    error: null
  }))
}));

const mockPush = jest.fn();

describe('CartPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
  });

  test('debe renderizar el carrito con productos', () => {
    render(<CartPage />);
    
    expect(screen.getByText('Carrito de Compras')).toBeInTheDocument();
    expect(screen.getByText('Vestido Negro')).toBeInTheDocument();
    expect(screen.getByText('Blusa Blanca')).toBeInTheDocument();
  });

  test('debe mostrar el total correctamente', () => {
    render(<CartPage />);
    
    expect(screen.getByText(/259.97/)).toBeInTheDocument();
  });

  test('debe mostrar el número de artículos', () => {
    render(<CartPage />);
    
    expect(screen.getAllByText(/3 productos/)).toHaveLength(2); // Aparece en dos lugares
  });

  test('debe tener botón para continuar comprando', () => {
    render(<CartPage />);
    
    const continueButton = screen.getByText('Continuar Comprando');
    expect(continueButton).toBeInTheDocument();
    
    expect(continueButton).toHaveAttribute('href', '/shop');
  });

  test('debe tener botón para proceder al checkout', () => {
    render(<CartPage />);
    
    const checkoutButton = screen.getByText('Proceder al Checkout');
    expect(checkoutButton).toBeInTheDocument();
    
    fireEvent.click(checkoutButton);
    expect(checkoutButton).toHaveAttribute('href', '/checkout');
  });

  test('debe mostrar información de producto', () => {
    render(<CartPage />);
    
    expect(screen.getByText('Talla: M')).toBeInTheDocument(); // Talla del vestido
    expect(screen.getByText('Color: Negro')).toBeInTheDocument(); // Color del vestido
    expect(screen.getByText('Talla: S')).toBeInTheDocument(); // Talla de la blusa
    expect(screen.getByText('Color: Blanco')).toBeInTheDocument(); // Color de la blusa
  });

  test('debe mostrar controles de cantidad', () => {
    render(<CartPage />);
    
    const quantityDisplays = screen.getAllByText(/^[12]$/);
    expect(quantityDisplays).toHaveLength(2);
  });
});
