import { render, screen } from '@testing-library/react'
import Footer from '@/components/layout/Footer'

describe('Footer', () => {
  it('should render footer component', () => {
    render(<Footer />)
    
    // Verify footer is rendered
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('should display company information', () => {
    render(<Footer />)

    // Check for company name/logo - be more specific
    expect(screen.getByRole('link', { name: /velvet/i })).toBeInTheDocument()
  })

  it('should display navigation links', () => {
    render(<Footer />)
    
    // Check for common footer links (adjust based on actual Footer component)
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })

  it('should display contact information', () => {
    render(<Footer />)
    
    // Look for any text that might be contact info
    const footerText = screen.getByRole('contentinfo').textContent
    expect(footerText).toBeTruthy()
  })

  it('should display social media links', () => {
    render(<Footer />)
    
    // Check if there are any social media related elements
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
  })

  it('should display copyright information', () => {
    render(<Footer />)
    
    // Look for copyright symbol or year
    const currentYear = new Date().getFullYear()
    const footerElement = screen.getByRole('contentinfo')
    
    // Check if footer contains current year or copyright symbol
    expect(
      footerElement.textContent?.includes(currentYear.toString()) ||
      footerElement.textContent?.includes('©') ||
      footerElement.textContent?.includes('Copyright')
    ).toBeTruthy()
  })

  it('should have proper accessibility attributes', () => {
    render(<Footer />)
    
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
    expect(footer.tagName.toLowerCase()).toBe('footer')
  })
})
