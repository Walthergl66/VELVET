import { render, screen } from '@testing-library/react'

// Simple test component to verify the test setup
function TestComponent() {
  return <div>Hello Test World</div>
}

describe('Test Setup Verification', () => {
  it('renders a simple component', () => {
    render(<TestComponent />)
    expect(screen.getByText('Hello Test World')).toBeInTheDocument()
  })

  it('can run basic assertions', () => {
    expect(1 + 1).toBe(2)
    expect('hello').toMatch(/hello/)
    expect([1, 2, 3]).toHaveLength(3)
  })

  it('can test async behavior', async () => {
    const promise = Promise.resolve('async result')
    const result = await promise
    expect(result).toBe('async result')
  })
})
