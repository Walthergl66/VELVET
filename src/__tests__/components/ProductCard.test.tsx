import { render, screen, fireEvent } from '@testing-library/react'
import ProductCard from '@/components/product/ProductCard'
import { Product } from '@/types'

// Mock del contexto del carrito
const mockAddToCart = jest.fn()
const mockIsInCart = jest.fn()

jest.mock('@/context/CartContext', () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
    isInCart: mockIsInCart,
    loading: false
  })
}))

// Mock de Next.js components
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode, href: string }) => (
    <a href={href}>{children}</a>
  )
})

jest.mock('next/image', () => {
  return ({ src, alt, className }: { src: string, alt: string, className?: string }) => (
    <img src={src} alt={alt} className={className} />
  )
})

describe('ProductCard', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Vestido Elegante',
    description: 'Un hermoso vestido para ocasiones especiales',
    price: 299.99,
    discount_price: null,
    images: ['https://example.com/image1.jpg'],
    category_id: 'vestidos',
    subcategory_id: null,
    stock: 10,
    sizes: ['S', 'M', 'L'],
    colors: ['Negro', 'Azul'],
    featured: false,
    tags: ['elegante', 'formal'],
    brand: 'VELVET',
    material: 'Algodón',
    care_instructions: 'Lavar a mano',
    sku: 'VE-001',
    weight: null,
    dimensions: null,
    active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockIsInCart.mockReturnValue(false)
  })

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Vestido Elegante')).toBeInTheDocument()
    expect(screen.getByText('$299.99')).toBeInTheDocument()
    expect(screen.getByAltText('Vestido Elegante')).toBeInTheDocument()
  })

  it('renders product with discount correctly', () => {
    const discountProduct = { ...mockProduct, discount_price: 199.99 }
    render(<ProductCard product={discountProduct} />)
    
    expect(screen.getByText('Vestido Elegante')).toBeInTheDocument()
    expect(screen.getByText('-33%')).toBeInTheDocument()
  })

  it('shows low stock warning when stock is 5 or less', () => {
    const lowStockProduct = { ...mockProduct, stock: 3 }
    render(<ProductCard product={lowStockProduct} />)
    
    expect(screen.getByText('¡Solo 3!')).toBeInTheDocument()
  })

  it('displays add to cart button', () => {
    render(<ProductCard product={mockProduct} />)
    
    const addButton = screen.getByText('Agregar al Carrito')
    expect(addButton).toBeInTheDocument()
  })

  it('handles click on add to cart button', () => {
    render(<ProductCard product={mockProduct} />)
    
    const addButton = screen.getByText('Agregar al Carrito')
    expect(addButton).toBeInTheDocument()
    
    fireEvent.click(addButton)
    
    // Verificar que el botón sigue disponible después del click
    expect(screen.getByText('Agregar al Carrito')).toBeInTheDocument()
  })
})
