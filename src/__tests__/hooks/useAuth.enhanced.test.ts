import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'

// Mock de Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      updateUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn(), id: 'test', callback: jest.fn() } }
      }))
    },
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ error: null })
      }))
    }))
  }
}))

import { supabase } from '@/lib/supabase'
const mockAuth = supabase.auth as any
const mockSupabaseFrom = supabase.from as any

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {
    first_name: 'Test',
    last_name: 'User'
  },
  aud: 'authenticated',
  created_at: '2024-01-01',
  updated_at: '2024-01-01'
}

const mockSession = {
  access_token: 'mock-token',
  refresh_token: 'mock-refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser
}

describe('useAuth Enhanced Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    })
    // Setup mock for supabase.from().update().eq()
    mockSupabaseFrom.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      })
    })
  })

  it('should initialize with default state', async () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
    expect(result.current.loading).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('should call signUp function', async () => {
    mockAuth.signUp.mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      const response = await result.current.signUp({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      })
      expect(typeof response.success).toBe('boolean')
    })

    expect(mockAuth.signUp).toHaveBeenCalled()
  })

  it('should call signIn function', async () => {
    mockAuth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      const response = await result.current.signIn({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(typeof response.success).toBe('boolean')
    })

    expect(mockAuth.signInWithPassword).toHaveBeenCalled()
  })

  it('should call signOut function', async () => {
    mockAuth.signOut.mockResolvedValue({ error: null })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signOut()
    })

    expect(mockAuth.signOut).toHaveBeenCalled()
  })

  it('should handle updateProfile function', async () => {
    // Setup user in state first
    mockAuth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    const { result } = renderHook(() => useAuth())

    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      const response = await result.current.updateProfile({
        first_name: 'Updated',
        last_name: 'Name'
      })
      expect(response.success).toBe(true)
    })

    expect(mockSupabaseFrom).toHaveBeenCalledWith('users')
  })

  it('should load existing session', async () => {
    mockAuth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockAuth.getSession).toHaveBeenCalled()
  })
})
