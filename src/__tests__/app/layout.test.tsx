import { render, screen } from '@testing-library/react';
import RootLayout, { metadata } from '@/app/layout';

// Mock de los componentes de layout
jest.mock('@/components/layout/Header', () => {
  return function MockHeader() {
    return <header data-testid="header">Header Component</header>;
  };
});

jest.mock('@/components/layout/Footer', () => {
  return function MockFooter() {
    return <footer data-testid="footer">Footer Component</footer>;
  };
});

// Mock del CartProvider
jest.mock('@/context/CartContext', () => ({
  CartProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="cart-provider">{children}</div>
  ),
}));

// Mock de Next.js font
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter-font',
  }),
}));

// Custom render para manejar el layout completo
function renderLayout(children: React.ReactNode) {
  const { container } = render(<RootLayout>{children}</RootLayout>);
  return container;
}

describe('RootLayout', () => {
  const mockChildren = <div data-testid="test-content">Test Content</div>;

  it('renders the complete layout structure with correct body classes', () => {
    renderLayout(mockChildren);

    // Verificar que el body tiene las clases correctas (añadidas por el componente)
    expect(document.body.className).toContain('inter-font');
    expect(document.body.className).toContain('antialiased');
  });

  it('renders CartProvider wrapper', () => {
    renderLayout(mockChildren);
    
    expect(screen.getByTestId('cart-provider')).toBeInTheDocument();
  });

  it('renders Header component', () => {
    renderLayout(mockChildren);
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('Header Component')).toBeInTheDocument();
  });

  it('renders Footer component', () => {
    renderLayout(mockChildren);
    
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByText('Footer Component')).toBeInTheDocument();
  });

  it('renders children content in main element', () => {
    renderLayout(mockChildren);
    
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('flex-grow');
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('has correct layout structure with min-height and flex', () => {
    renderLayout(mockChildren);
    
    const layoutDiv = document.querySelector('.min-h-screen.flex.flex-col');
    expect(layoutDiv).toBeInTheDocument();
  });

  it('renders components in correct order', () => {
    renderLayout(mockChildren);
    
    const layoutDiv = document.querySelector('.min-h-screen.flex.flex-col');
    const children = Array.from(layoutDiv?.children || []);
    
    // Verificar orden: Header, Main, Footer
    expect(children[0]).toHaveAttribute('data-testid', 'header');
    expect(children[1].tagName.toLowerCase()).toBe('main');
    expect(children[2]).toHaveAttribute('data-testid', 'footer');
  });

  it('accepts and renders different children content', () => {
    const differentContent = (
      <div data-testid="different-content">
        <h1>Different Content</h1>
        <p>Another paragraph</p>
      </div>
    );

    renderLayout(differentContent);
    
    expect(screen.getByTestId('different-content')).toBeInTheDocument();
    expect(screen.getByText('Different Content')).toBeInTheDocument();
    expect(screen.getByText('Another paragraph')).toBeInTheDocument();
  });

  it('maintains proper document structure', () => {
    renderLayout(mockChildren);
    
    // Verificar que el HTML tiene el atributo lang="es"
    expect(document.documentElement.getAttribute('lang')).toBe('es');
  });
});

describe('Metadata', () => {
  it('has correct metadata structure', () => {
    expect(metadata).toBeDefined();
    expect(metadata.title).toBe('VELVET - Moda Elegante y Sofisticada');
    expect(metadata.description).toBe('Descubre la colección más elegante de ropa y accesorios en VELVET. Moda de calidad premium para hombres y mujeres.');
  });

  it('has correct keywords', () => {
    expect(metadata.keywords).toBe('moda, ropa, elegante, sofisticada, hombre, mujer, accesorios, premium');
  });

  it('has correct authors', () => {
    expect(metadata.authors).toEqual([{ name: 'VELVET' }]);
  });

  it('has correct OpenGraph metadata', () => {
    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph?.title).toBe('VELVET - Moda Elegante y Sofisticada');
    expect(metadata.openGraph?.description).toBe('Descubre la colección más elegante de ropa y accesorios en VELVET.');
    expect((metadata.openGraph as any)?.type).toBe('website');
    expect((metadata.openGraph as any)?.locale).toBe('es_MX');
  });

  it('has correct Twitter metadata', () => {
    expect(metadata.twitter).toBeDefined();
    expect((metadata.twitter as any)?.card).toBe('summary_large_image');
    expect(metadata.twitter?.title).toBe('VELVET - Moda Elegante y Sofisticada');
    expect(metadata.twitter?.description).toBe('Descubre la colección más elegante de ropa y accesorios en VELVET.');
  });
});
