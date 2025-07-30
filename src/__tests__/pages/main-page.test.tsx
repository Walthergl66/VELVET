import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';

// Mock de los hooks
jest.mock('@/hooks/useProducts', () => ({
  useProducts: jest.fn(() => ({
    products: [
      {
        id: 1,
        name: 'Vestido Elegante',
        price: 129.99,
        image: '/images/vestido.jpg',
        category: 'vestidos',
        featured: true,
        brand: 'VELVET',
        sku: 'VEL001',
        active: true
      }
    ],
    loading: false,
    error: null
  }))
}));

// Mock de Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock del componente ProductCard
jest.mock('@/components/product/ProductCard', () => {
  return function MockProductCard({ product }: any) {
    return (
      <div data-testid={`product-card-${product.id}`}>
        <h3>{product.name}</h3>
        <span>${product.price}</span>
      </div>
    );
  };
});

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe renderizar el hero section', () => {
    render(<Home />);
    
    expect(screen.getByText((content, element) => 
      element?.textContent === 'VELVET'
    )).toBeInTheDocument();
    expect(screen.getByText('Elegancia redefinida para el mundo moderno')).toBeInTheDocument();
  });

  test('debe mostrar los botones de navegación', () => {
    render(<Home />);
    
    expect(screen.getByText('Explorar Colección')).toBeInTheDocument();
    expect(screen.getByText('Ver Destacados')).toBeInTheDocument();
  });

  test('debe mostrar productos destacados', () => {
    render(<Home />);
    
    expect(screen.getByText('Productos Destacados')).toBeInTheDocument();
    expect(screen.getByTestId('product-card-1')).toBeInTheDocument();
  });

  test('debe mostrar las categorías principales', () => {
    render(<Home />);
    
    expect(screen.getByText('Explora por Categoría')).toBeInTheDocument();
    expect(screen.getByText('Mujer')).toBeInTheDocument();
    expect(screen.getByText('Hombre')).toBeInTheDocument();
    expect(screen.getByText('Accesorios')).toBeInTheDocument();
  });

  test('debe mostrar la sección de newsletter', () => {
    render(<Home />);
    
    expect(screen.getByText('Mantente al Día con VELVET')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tu dirección de email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /suscribirse/i })).toBeInTheDocument();
  });

  test('debe tener enlaces correctos en el hero section', () => {
    render(<Home />);
    
    const exploreLink = screen.getByText('Explorar Colección').closest('a');
    const featuredLink = screen.getByText('Ver Destacados').closest('a');
    
    expect(exploreLink).toHaveAttribute('href', '/shop');
    expect(featuredLink).toHaveAttribute('href', '/shop?featured=true');
  });
});
