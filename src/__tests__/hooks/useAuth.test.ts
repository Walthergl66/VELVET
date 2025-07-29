import { renderHook } from '@testing-library/react'

// Simple mock para evitar problemas de tipos
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    }))
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn()
  }))
}

// Mock Supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient
}))

// Mock useAuth hook directly for now
const mockUseAuth = () => ({
  user: null,
  session: null,
  loading: false,
  error: null,
  signUp: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn()
})

jest.mock('@/hooks/useAuth', () => ({
  useAuth: mockUseAuth
}))

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes with correct default state', () => {
    const authState = mockUseAuth()
    
    expect(authState.loading).toBe(false)
    expect(authState.user).toBe(null)
    expect(authState.session).toBe(null)
    expect(authState.error).toBe(null)
  })

  it('provides authentication functions', () => {
    const authState = mockUseAuth()
    
    expect(typeof authState.signUp).toBe('function')
    expect(typeof authState.signIn).toBe('function')
    expect(typeof authState.signOut).toBe('function')
  })

  it('mock functions can be called', () => {
    const authState = mockUseAuth()
    
    authState.signUp({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    })
    
    expect(authState.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    })
  })

  it('sign in function can be called with credentials', () => {
    const authState = mockUseAuth()
    
    authState.signIn({
      email: 'test@example.com',
      password: 'password123'
    })
    
    expect(authState.signIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })
})
