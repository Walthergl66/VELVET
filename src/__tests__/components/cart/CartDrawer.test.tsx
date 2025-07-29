import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CartDrawer from '@/components/cart/CartDrawer'
import { useCart } from '@/context/CartContext'

// Mock del contexto del carrito
jest.mock('@/context/CartContext')

const mockUseCart = useCart as jest.MockedFunction<typeof useCart>

const mockCartItem = {
  id: '1',
  user_id: 'user-1',
  product_id: 'product-1',
  quantity: 2,
  size: 'M',
  color: 'Negro',
  added_at: '2024-01-01',
  updated_at: '2024-01-01',
  product: {
    id: 'product-1',
    name: 'Vestido Elegante',
    description: 'Vestido elegante para ocasiones especiales',
    price: 150.00,
    discount_price: null,
    images: ['image1.jpg'],
    category_id: 'cat1',
    subcategory_id: null,
    image_urls: ['image1.jpg'],
    sizes: ['S', 'M', 'L'],
    colors: ['Negro', 'Rojo'],
    stock: 10,
    featured: true,
    tags: ['elegante'],
    brand: 'VELVET',
    sku: 'VE001',
    weight: 0.5,
    dimensions: '30x40x5',
    material: 'Algodón',
    care_instructions: 'Lavar en frío',
    is_active: true,
    active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
}

const mockEmptyCart = {
  items: [],
  total: 0,
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0
}

const mockCart = {
  items: [mockCartItem],
  total: 300.00,
  subtotal: 280.00,
  tax: 20.00,
  shipping: 0,
  discount: 0
}

describe('CartDrawer', () => {
  const mockUpdateQuantity = jest.fn()
  const mockRemoveFromCart = jest.fn()
  const mockClearCart = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseCart.mockReturnValue({
      cart: mockCart,
      loading: false,
      error: null,
      addToCart: jest.fn(),
      updateQuantity: mockUpdateQuantity,
      removeFromCart: mockRemoveFromCart,
      clearCart: mockClearCart,
      getItemCount: jest.fn().mockReturnValue(2),
      isInCart: jest.fn()
    })
  })

  it('should render cart drawer when open', () => {
    render(<CartDrawer isOpen={true} onClose={jest.fn()} />)
    
    expect(screen.getByText(/carrito de compras/i)).toBeInTheDocument()
  })

  it('should not render cart drawer when closed', () => {
    render(<CartDrawer isOpen={false} onClose={jest.fn()} />)
    
    expect(screen.queryByText(/carrito de compras/i)).not.toBeInTheDocument()
  })

  it('should display cart items', () => {
    render(<CartDrawer isOpen={true} onClose={jest.fn()} />)
    
    expect(screen.getByText('Vestido Elegante')).toBeInTheDocument()
    expect(screen.getByText('M')).toBeInTheDocument()
    expect(screen.getByText('Negro')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
  })

  it('should display cart total', () => {
    render(<CartDrawer isOpen={true} onClose={jest.fn()} />)
    
    expect(screen.getByText(/total/i)).toBeInTheDocument()
    expect(screen.getByText(/300/)).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = jest.fn()
    render(<CartDrawer isOpen={true} onClose={mockOnClose} />)
    
    const closeButton = screen.getByLabelText(/cerrar/i)
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should update item quantity', async () => {
    render(<CartDrawer isOpen={true} onClose={jest.fn()} />)
    
    const quantityInput = screen.getByDisplayValue('2')
    fireEvent.change(quantityInput, { target: { value: '3' } })
    
    await waitFor(() => {
      expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 3)
    })
  })

  it('should remove item from cart', async () => {
    render(<CartDrawer isOpen={true} onClose={jest.fn()} />)
    
    const removeButton = screen.getByLabelText(/eliminar/i)
    fireEvent.click(removeButton)
    
    await waitFor(() => {
      expect(mockRemoveFromCart).toHaveBeenCalledWith('1')
    })
  })

  it('should clear entire cart', async () => {
    render(<CartDrawer isOpen={true} onClose={jest.fn()} />)
    
    const clearButton = screen.getByText(/vaciar carrito/i)
    fireEvent.click(clearButton)
    
    await waitFor(() => {
      expect(mockClearCart).toHaveBeenCalled()
    })
  })

  it('should display empty cart message when no items', () => {
    mockUseCart.mockReturnValue({
      cart: mockEmptyCart,
      loading: false,
      error: null,
      addToCart: jest.fn(),
      updateQuantity: mockUpdateQuantity,
      removeFromCart: mockRemoveFromCart,
      clearCart: mockClearCart,
      getItemCount: jest.fn().mockReturnValue(0),
      isInCart: jest.fn()
    })
    
    render(<CartDrawer isOpen={true} onClose={jest.fn()} />)
    
    expect(screen.getByText(/carrito está vacío/i)).toBeInTheDocument()
  })

  it('should show loading state', () => {
    mockUseCart.mockReturnValue({
      cart: mockEmptyCart,
      loading: true,
      error: null,
      addToCart: jest.fn(),
      updateQuantity: mockUpdateQuantity,
      removeFromCart: mockRemoveFromCart,
      clearCart: mockClearCart,
      getItemCount: jest.fn().mockReturnValue(0),
      isInCart: jest.fn()
    })
    
    render(<CartDrawer isOpen={true} onClose={jest.fn()} />)
    
    expect(screen.getByText(/cargando/i)).toBeInTheDocument()
  })

  it('should display error message when there is an error', () => {
    mockUseCart.mockReturnValue({
      cart: mockEmptyCart,
      loading: false,
      error: 'Error loading cart',
      addToCart: jest.fn(),
      updateQuantity: mockUpdateQuantity,
      removeFromCart: mockRemoveFromCart,
      clearCart: mockClearCart,
      getItemCount: jest.fn().mockReturnValue(0),
      isInCart: jest.fn()
    })
    
    render(<CartDrawer isOpen={true} onClose={jest.fn()} />)
    
    expect(screen.getByText('Error loading cart')).toBeInTheDocument()
  })

  it('should have checkout button when items exist', () => {
    render(<CartDrawer isOpen={true} onClose={jest.fn()} />)
    
    expect(screen.getByText(/proceder al pago/i)).toBeInTheDocument()
  })

  it('should handle product image display', () => {
    render(<CartDrawer isOpen={true} onClose={jest.fn()} />)
    
    const productImage = screen.getByAltText('Vestido Elegante')
    expect(productImage).toBeInTheDocument()
    expect(productImage).toHaveAttribute('src', expect.stringContaining('image1.jpg'))
  })

  it('should display correct price formatting', () => {
    render(<CartDrawer isOpen={true} onClose={jest.fn()} />)
    
    // Should display individual item price
    expect(screen.getByText(/150/)).toBeInTheDocument()
  })

  it('should close drawer when clicking outside (if implemented)', () => {
    const mockOnClose = jest.fn()
    render(<CartDrawer isOpen={true} onClose={mockOnClose} />)
    
    // This test would depend on the specific implementation
    // For now, just verify the drawer structure exists
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
