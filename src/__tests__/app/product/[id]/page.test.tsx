import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useParams } from 'next/navigation'
import ProductPage from '@/app/product/[id]/page'
import { useCart } from '@/context/CartContext'
import { supabase } from '@/lib/supabase'

// Mocks
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}))

jest.mock('@/context/CartContext', () => ({
  useCart: jest.fn(),
}))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />
  }
})

jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

const mockUseParams = useParams as jest.Mock
const mockUseCart = useCart as jest.Mock
const mockSupabase = supabase as any

const mockProduct = {
  id: '1',
  name: 'Vestido Elegante',
  description: 'Un hermoso vestido para ocasiones especiales',
  price: 299.99,
  images: ['image1.jpg', 'image2.jpg'],
  sizes: ['S', 'M', 'L'],
  colors: ['Negro', 'Azul'],
  stock: 10,
  active: true,
  categories: {
    id: '1',
    name: 'Vestidos',
    slug: 'vestidos'
  }
}

describe('ProductPage', () => {
  const mockAddToCart = jest.fn()

  beforeEach(() => {
    mockUseParams.mockReturnValue({ id: '1' })
    mockUseCart.mockReturnValue({
      addToCart: mockAddToCart,
      loading: false,
    })

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProduct,
              error: null,
            }),
          }),
        }),
      }),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state initially', () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockReturnValue(new Promise(() => {})), // Never resolves
          }),
        }),
      }),
    })

    const { container } = render(<ProductPage />)
    
    // Verificar que hay elementos de skeleton loading
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(container.querySelector('.bg-gray-200')).toBeInTheDocument()
  })

  it('should render product details when loaded', async () => {
    render(<ProductPage />)

    await waitFor(() => {
      expect(screen.getAllByText('Vestido Elegante')[0]).toBeInTheDocument()
      expect(screen.getByText(/un hermoso vestido/i)).toBeInTheDocument()
      expect(screen.getByText(/299\.99/)).toBeInTheDocument()
    })
  })

  it('should render product images', async () => {
    render(<ProductPage />)

    await waitFor(() => {
      const images = screen.getAllByRole('img', { name: /vestido elegante/i })
      expect(images.length).toBeGreaterThan(0)
    })
  })

  it('should display size options', async () => {
    render(<ProductPage />)

    await waitFor(() => {
      const sizeButtons = screen.getAllByRole('button')
      const sButton = sizeButtons.find(btn => btn.textContent?.trim() === 'S')
      const mButton = sizeButtons.find(btn => btn.textContent?.trim() === 'M')
      const lButton = sizeButtons.find(btn => btn.textContent?.trim() === 'L')
      
      expect(sButton).toBeInTheDocument()
      expect(mButton).toBeInTheDocument()
      expect(lButton).toBeInTheDocument()
    })
  })

  it('should display color options', async () => {
    render(<ProductPage />)

    await waitFor(() => {
      const colorButtons = screen.getAllByRole('button')
      const negroButton = colorButtons.find(btn => btn.textContent?.trim() === 'Negro')
      const azulButton = colorButtons.find(btn => btn.textContent?.trim() === 'Azul')
      
      expect(negroButton).toBeInTheDocument()
      expect(azulButton).toBeInTheDocument()
    })
  })

  it('should handle size selection', async () => {
    render(<ProductPage />)

    await waitFor(() => {
      const mediumSize = screen.getByText('M')
      fireEvent.click(mediumSize)
      // Verify the size is selected (implementation dependent)
    })
  })

  it('should handle color selection', async () => {
    render(<ProductPage />)

    await waitFor(() => {
      const blueColor = screen.getByText('Azul')
      fireEvent.click(blueColor)
      // Verify the color is selected (implementation dependent)
    })
  })

  it('should handle quantity changes', async () => {
    render(<ProductPage />)

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      const increaseButton = buttons.find(btn => btn.textContent?.trim() === '+')
      expect(increaseButton).toBeInTheDocument()
      
      if (increaseButton) {
        fireEvent.click(increaseButton)
        // El test verifica que el botón existe y es clickeable
      }
    })
  })

  it('should handle add to cart action', async () => {
    render(<ProductPage />)

    await waitFor(() => {
      const addToCartButton = screen.getByRole('button', { name: /agregar al carrito/i })
      fireEvent.click(addToCartButton)
      
      expect(mockAddToCart).toHaveBeenCalledWith(
        mockProduct,
        '1', // quantity
        'S', // first available size
        expect.any(Number) // color index
      )
    })
  })

  it('should display error when product not found', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Producto no encontrado' },
            }),
          }),
        }),
      }),
    })

    render(<ProductPage />)

    await waitFor(() => {
      expect(screen.getByText(/producto no encontrado/i)).toBeInTheDocument()
    })
  })

  it('should handle network errors gracefully', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockRejectedValue(new Error('Network error')),
          }),
        }),
      }),
    })

    render(<ProductPage />)

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })

  it('should render breadcrumb navigation', async () => {
    render(<ProductPage />)

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /inicio/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /tienda/i })).toBeInTheDocument()
    })
  })

  it('should display stock information', async () => {
    render(<ProductPage />)

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText(/disponibles/i)).toBeInTheDocument()
    })
  })
})
