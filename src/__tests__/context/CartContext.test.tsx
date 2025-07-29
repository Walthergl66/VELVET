import { renderHook, act, waitFor } from '@testing-library/react'
import { CartProvider, useCart } from '@/context/CartContext'
import { Product } from '@/types'

// Mock de Supabase
jest.mock('@/lib/supabase', () => ({
  getUserCart: jest.fn(),
  addToCart: jest.fn(),
  updateCartItemQuantity: jest.fn(),
  removeFromCart: jest.fn(),
  clearCart: jest.fn(),
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } }
      }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      }))
    }
  }
}))

import * as supabaseLib from '@/lib/supabase'
const mockGetUserCart = supabaseLib.getUserCart as any
const mockAddToCartDB = supabaseLib.addToCart as any
const mockUpdateCartItemQuantity = supabaseLib.updateCartItemQuantity as any
const mockRemoveFromCartDB = supabaseLib.removeFromCart as any
const mockClearCartDB = supabaseLib.clearCart as any

// Configurar mocks por defecto
beforeEach(() => {
  mockGetUserCart.mockResolvedValue({ data: [], error: null })
  mockAddToCartDB.mockResolvedValue({ data: null, error: null })
  mockUpdateCartItemQuantity.mockResolvedValue({ data: null, error: null })
  mockRemoveFromCartDB.mockResolvedValue({ data: null, error: null })
  mockClearCartDB.mockResolvedValue({ data: null, error: null })
})

// Wrapper para el provider
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  )
}

describe('CartContext', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Vestido Test',
    description: 'Descripción test',
    price: 100,
    discount_price: null,
    images: ['test.jpg'],
    category_id: 'cat1',
    subcategory_id: null,
    stock: 10,
    sizes: ['S', 'M', 'L'],
    colors: ['Negro', 'Azul'],
    featured: false,
    tags: [],
    brand: 'VELVET',
    material: null,
    care_instructions: null,
    sku: null,
    weight: null,
    dimensions: null,
    active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    const { getUserCart } = require('@/lib/supabase')
    getUserCart.mockResolvedValue([])
  })

  it('should initialize with empty cart', async () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.cart.items).toEqual([])
      expect(result.current.getItemCount()).toBe(0)
    })
  })

  it('should add item to cart successfully', async () => {
    const mockCartItem = {
      id: 'item1',
      product_id: '1',
      quantity: 1,
      size: 'M',
      color: 'Negro',
      product: mockProduct
    }

    mockAddToCartDB.mockResolvedValue({ data: mockCartItem, error: null })

    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper()
    })

    await act(async () => {
      await result.current.addToCart(mockProduct, 'M', 'Negro', 1)
    })

    expect(mockAddToCartDB).toHaveBeenCalledWith('1', 1, 'M', 'Negro')
  })

  it('should remove item from cart', async () => {
    mockRemoveFromCartDB.mockResolvedValue({ data: null, error: null })

    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper()
    })

    await act(async () => {
      await result.current.removeFromCart('item1')
    })

    expect(mockRemoveFromCartDB).toHaveBeenCalledWith('item1')
  })

  it('should update item quantity', async () => {
    mockUpdateCartItemQuantity.mockResolvedValue({ data: null, error: null })

    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper()
    })

    await act(async () => {
      await result.current.updateQuantity('item1', 3)
    })

    expect(mockUpdateCartItemQuantity).toHaveBeenCalledWith('item1', 3)
  })

  it('should clear cart', async () => {
    mockClearCartDB.mockResolvedValue({ data: null, error: null })

    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper()
    })

    await act(async () => {
      await result.current.clearCart()
    })

    expect(mockClearCartDB).toHaveBeenCalled()
  })

  it('should check if item is in cart', async () => {
    const mockCartItems = [{
      id: 'item1',
      product_id: '1',
      quantity: 1,
      size: 'M',
      color: 'Negro',
      product: mockProduct
    }]

    mockGetUserCart.mockResolvedValue({ data: mockCartItems, error: null })

    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isInCart('1', 'M', 'Negro')).toBe(true)
      expect(result.current.isInCart('1', 'L', 'Azul')).toBe(false)
    })
  })

  it('should calculate total item count correctly', async () => {
    const mockCartItems = [
      {
        id: 'item1',
        product_id: '1',
        quantity: 2,
        size: 'M',
        color: 'Negro',
        product: mockProduct
      },
      {
        id: 'item2',
        product_id: '2',
        quantity: 3,
        size: 'L',
        color: 'Azul',
        product: { ...mockProduct, id: '2' }
      }
    ]

    mockGetUserCart.mockResolvedValue({ data: mockCartItems, error: null })

    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.getItemCount()).toBe(5)
    })
  })

  it('should handle loading state', async () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper()
    })

    // Al inicio debería estar cargando
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('should handle errors correctly', async () => {
    // Silenciar console.error para este test específico
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const errorMessage = 'Error adding to cart'
    mockAddToCartDB.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper()
    })

    await act(async () => {
      await result.current.addToCart(mockProduct, 'M', 'Negro', 1)
    })

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage)
    })

    // Restaurar console.error
    consoleSpy.mockRestore()
  })
})
