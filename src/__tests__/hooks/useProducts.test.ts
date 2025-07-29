import { renderHook, waitFor, act } from '@testing-library/react'
import { useProducts, useProduct, useProductSearch, useRelatedProducts } from '@/hooks/useProducts'

// Mock de Supabase functions
jest.mock('@/lib/supabase', () => ({
  getProducts: jest.fn(),
  getProductById: jest.fn(),
  getCategories: jest.fn()
}))

import { getProducts, getProductById, getCategories } from '@/lib/supabase'

const mockGetProducts = getProducts as jest.MockedFunction<typeof getProducts>
const mockGetProductById = getProductById as jest.MockedFunction<typeof getProductById>
const mockGetCategories = getCategories as jest.MockedFunction<typeof getCategories>

const mockProducts = [
  {
    id: '1',
    name: 'Vestido Elegante',
    description: 'Vestido elegante para ocasiones especiales',
    price: 150.00,
    category_id: 'cat1',
    image_urls: ['image1.jpg'],
    sizes: ['S', 'M', 'L'],
    colors: ['Negro', 'Rojo'],
    stock: 10,
    featured: true,
    created_at: '2024-01-01'
  },
  {
    id: '2',
    name: 'Blusa Casual',
    description: 'Blusa casual para el día a día',
    price: 80.00,
    category_id: 'cat2',
    image_urls: ['image2.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blanco', 'Azul'],
    stock: 15,
    featured: false,
    created_at: '2024-01-02'
  }
]

const mockCategories = [
  { id: 'cat1', name: 'Vestidos', slug: 'vestidos' },
  { id: 'cat2', name: 'Blusas', slug: 'blusas' }
]

describe('useProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    mockGetProducts.mockResolvedValue({
      data: mockProducts,
      error: null,
      count: mockProducts.length
    })
    
    mockGetCategories.mockResolvedValue({
      data: mockCategories,
      error: null
    })
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useProducts())

    expect(result.current.products).toEqual([])
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
    expect(result.current.total).toBe(0)
  })

  it('should fetch products successfully', async () => {
    const { result } = renderHook(() => useProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.products).toHaveLength(2)
    expect(result.current.products[0].name).toBe('Vestido Elegante')
    expect(result.current.error).toBeNull()
    expect(result.current.total).toBe(2)
  })

  it('should fetch featured products', async () => {
    const { result } = renderHook(() => useProducts({ featured: true }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGetProducts).toHaveBeenCalledWith(
      expect.objectContaining({ featured: true })
    )
  })

  it('should filter by category', async () => {
    const { result } = renderHook(() => useProducts({ category: 'cat1' }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGetProducts).toHaveBeenCalledWith(
      expect.objectContaining({ category_id: 'cat1' })
    )
  })

  it('should handle search query', async () => {
    const { result } = renderHook(() => useProducts({ search: 'vestido' }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGetProducts).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'vestido' })
    )
  })

  it('should handle price range filter', async () => {
    const { result } = renderHook(() => useProducts({ 
      min_price: 50, 
      max_price: 200 
    }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGetProducts).toHaveBeenCalledWith(
      expect.objectContaining({ min_price: 50, max_price: 200 })
    )
  })

  it('should handle sort options', async () => {
    const { result } = renderHook(() => useProducts({ 
      sort_by: 'price', 
      sort_order: 'desc' 
    }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGetProducts).toHaveBeenCalledWith(
      expect.objectContaining({ sort_by: 'price', sort_order: 'desc' })
    )
  })

  it('should handle error when fetching products', async () => {
    const errorObj = new Error('Error fetching products') as any
    errorObj.message = 'Error fetching products'
    
    mockGetProducts.mockResolvedValue({
      data: null,
      error: errorObj,
      count: 0
    })

    const { result } = renderHook(() => useProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.products).toEqual([])
    expect(result.current.error).toBe('Error fetching products')
  })

  it('should convert category slug to ID', async () => {
    const { result } = renderHook(() => useProducts({ category: 'vestidos' }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGetCategories).toHaveBeenCalled()
    expect(mockGetProducts).toHaveBeenCalledWith(
      expect.objectContaining({ category_id: 'cat1' })
    )
  })
})

describe('useProduct', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    mockGetProductById.mockResolvedValue({
      data: mockProducts[0],
      error: null
    })
    
    mockGetCategories.mockResolvedValue({
      data: mockCategories,
      error: null
    })
  })

  it('should fetch single product successfully', async () => {
    const { result } = renderHook(() => useProduct('1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.product?.name).toBe('Vestido Elegante')
    expect(result.current.error).toBeNull()
  })

  it('should handle error when product not found', async () => {
    mockGetProductById.mockResolvedValue({
      data: null,
      error: null
    })

    const { result } = renderHook(() => useProduct('999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.product).toBeNull()
    expect(result.current.error).toBe('Producto no encontrado')
  })

  it('should not fetch when id is empty', () => {
    const { result } = renderHook(() => useProduct(''))

    expect(result.current.loading).toBe(true)
    expect(mockGetProductById).not.toHaveBeenCalled()
  })
})

describe('useProductSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    
    mockGetProducts.mockResolvedValue({
      data: [mockProducts[0]],
      error: null,
      count: 1
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should debounce search query', async () => {
    const { result, rerender } = renderHook(
      ({ query }) => useProductSearch(query, 300),
      { initialProps: { query: '' } }
    )

    // Change query multiple times
    rerender({ query: 'v' })
    rerender({ query: 've' })
    rerender({ query: 'ves' })

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGetProducts).toHaveBeenCalledTimes(1)
    expect(mockGetProducts).toHaveBeenCalledWith({
      search: 'ves',
      limit: 8
    })
  })

  it('should return empty suggestions for empty query', () => {
    const { result } = renderHook(() => useProductSearch(''))

    expect(result.current.suggestions).toEqual([])
    expect(result.current.loading).toBe(false)
  })
})

describe('useRelatedProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    mockGetProductById.mockResolvedValue({
      data: mockProducts[0],
      error: null
    })
    
    mockGetProducts.mockResolvedValue({
      data: mockProducts,
      error: null,
      count: 2
    })
  })

  it('should fetch related products', async () => {
    const { result } = renderHook(() => useRelatedProducts('1', 4))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGetProductById).toHaveBeenCalledWith('1')
    expect(mockGetProducts).toHaveBeenCalledWith({
      category_id: 'cat1',
      limit: 5
    })
    expect(result.current.relatedProducts).toHaveLength(1) // Excludes the original product
  })

  it('should not fetch when productId is empty', () => {
    const { result } = renderHook(() => useRelatedProducts('', 4))

    expect(result.current.loading).toBe(true)
    expect(mockGetProductById).not.toHaveBeenCalled()
  })
})
