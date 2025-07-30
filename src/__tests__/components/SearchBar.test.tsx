import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from '@/components/ui/SearchBar'

// Mock useRouter
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('SearchBar Component', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders correctly with default placeholder', () => {
    render(<SearchBar />)
    
    expect(screen.getByPlaceholderText('Buscar productos...')).toBeTruthy()
    expect(screen.getByRole('button')).toBeTruthy()
  })

  it('renders with custom placeholder', () => {
    render(<SearchBar placeholder="Buscar ropa..." />)
    
    expect(screen.getByPlaceholderText('Buscar ropa...')).toBeTruthy()
  })

  it('updates input value when typing', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Buscar productos...')
    await user.type(input, 'vestidos')
    
    expect(input).toHaveValue('vestidos')
  })

  it('shows suggestions when typing', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Buscar productos...')
    await user.type(input, 'vest')
    
    await waitFor(() => {
      expect(screen.getByText('Vestidos')).toBeTruthy()
    })
  })

  it('navigates to search page on form submit', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Buscar productos...')
    await user.type(input, 'vestidos')
    
    const form = input.closest('form')
    if (form) {
      fireEvent.submit(form)
    }
    
    expect(mockPush).toHaveBeenCalledWith('/shop?search=vestidos')
  })

  it('does not submit empty search', async () => {
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Buscar productos...')
    const form = input.closest('form')
    
    if (form) {
      fireEvent.submit(form)
    }
    
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('trims whitespace before searching', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Buscar productos...')
    await user.type(input, '  vestidos  ')
    
    const form = input.closest('form')
    if (form) {
      fireEvent.submit(form)
    }
    
    expect(mockPush).toHaveBeenCalledWith('/shop?search=vestidos')
  })

  it('applies custom className', () => {
    render(<SearchBar className="custom-search" />)
    
    const container = screen.getByPlaceholderText('Buscar productos...').closest('.custom-search')
    expect(container).toBeTruthy()
  })
})
