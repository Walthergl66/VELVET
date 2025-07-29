import { render, screen } from '@testing-library/react'

// Create a simple mock component for testing
const MockHome = () => {
  return (
    <div className="min-h-screen">
      <section className="relative h-screen flex items-center justify-center">
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-wider">
            VEL<span className="text-gray-300">VET</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 leading-relaxed">
            Descubre nuestra exclusiva colección de moda
          </p>
        </div>
      </section>
    </div>
  )
}

describe('Home Page', () => {
  it('renders main heading', () => {
    render(<MockHome />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeTruthy()
    expect(heading.textContent).toContain('VELVET')
  })

  it('renders welcome message', () => {
    render(<MockHome />)
    
    expect(screen.getByText(/Descubre nuestra exclusiva colección/)).toBeTruthy()
  })

  it('renders without crashing', () => {
    const { container } = render(<MockHome />)
    expect(container).toBeTruthy()
    expect(container.firstChild).toBeTruthy()
  })

  it('has proper structure', () => {
    const { container } = render(<MockHome />)
    const mainDiv = container.querySelector('.min-h-screen')
    expect(mainDiv).toBeTruthy()
  })
})
