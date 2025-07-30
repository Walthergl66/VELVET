import { renderHook, waitFor, act } from '@testing-library/react'
import { useCategories } from '@/hooks/useCategories'

// Mock Supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [
              { id: '1', name: 'Vestidos', slug: 'vestidos', created_at: '2024-01-01' },
              { id: '2', name: 'Tops', slug: 'tops', created_at: '2024-01-01' },
              { id: '3', name: 'Bottoms', slug: 'bottoms', created_at: '2024-01-01' }
            ],
            error: null
          }))
        }))
      }))
    }))
  }
}))

describe('useCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch categories successfully', async () => {
    const { result } = renderHook(() => useCategories())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.categories).toHaveLength(3)
    expect(result.current.categories[0].name).toBe('Vestidos')
    expect(result.current.error).toBeNull()
  })

  it('should get category by slug', async () => {
    const { result } = renderHook(() => useCategories())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const category = result.current.getCategoryBySlug('vestidos')
    expect(category?.name).toBe('Vestidos')

    const nonExistent = result.current.getCategoryBySlug('non-existent')
    expect(nonExistent).toBeUndefined()
  })

  it('should get category by id', async () => {
    const { result } = renderHook(() => useCategories())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const category = result.current.getCategoryById('2')
    expect(category?.name).toBe('Tops')

    const nonExistent = result.current.getCategoryById('999')
    expect(nonExistent).toBeUndefined()
  })
})
