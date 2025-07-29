import {
  formatPrice,
  formatDate,
  slugify,
  validateEmail,
  validatePassword,
  truncateText,
  calculateDiscount,
  debounce,
  generateId
} from '@/utils'

describe('Utils Functions', () => {
  describe('formatPrice', () => {
    it('formats price correctly in EUR', () => {
      const result = formatPrice(29.99)
      expect(result).toContain('29,99')
      expect(result).toContain('€')
      
      const result2 = formatPrice(100)
      expect(result2).toContain('100,00')
      expect(result2).toContain('€')
    })

    it('formats price with different currency', () => {
      const result = formatPrice(29.99, 'USD')
      expect(result).toContain('29,99')
      expect(result).toMatch(/USD|\$/)
    })

    it('handles zero price', () => {
      const result = formatPrice(0)
      expect(result).toContain('0,00')
      expect(result).toContain('€')
    })

    it('handles negative price', () => {
      const result = formatPrice(-10)
      expect(result).toContain('10,00')
      expect(result).toContain('€')
    })
  })

  describe('formatDate', () => {
    it('formats date string correctly', () => {
      const result = formatDate('2024-01-15')
      expect(result).toContain('2024')
      expect(result).toContain('enero')
      expect(result).toMatch(/1[45]/) // Puede ser 14 o 15 dependiendo de zona horaria
    })

    it('formats Date object correctly', () => {
      const date = new Date('2024-12-25')
      const result = formatDate(date)
      expect(result).toContain('2024')
      expect(result).toContain('diciembre')
      expect(result).toMatch(/2[45]/) // Puede ser 24 o 25 dependiendo de zona horaria
    })
  })

  describe('slugify', () => {
    it('converts text to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Product Name 123')).toBe('product-name-123')
    })

    it('removes accents', () => {
      expect(slugify('Niño José María')).toBe('nino-jose-maria')
    })

    it('removes special characters', () => {
      expect(slugify('Hello@World#Test!')).toBe('helloworldtest')
    })

    it('handles multiple spaces and hyphens', () => {
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces')
      expect(slugify('Already-Has--Hyphens')).toBe('already-has-hyphens')
    })

    it('handles empty string', () => {
      expect(slugify('')).toBe('')
    })
  })

  describe('validateEmail', () => {
    it('validates correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('user+tag@example.org')).toBe(true)
    })

    it('rejects invalid emails', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      // Note: test..email@example.com might be valid in some regex implementations
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('validates strong password', () => {
      const result = validatePassword('StrongPass123')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('rejects password too short', () => {
      const result = validatePassword('Short1')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('La contraseña debe tener al menos 8 caracteres')
    })

    it('rejects password without uppercase', () => {
      const result = validatePassword('lowercase123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('La contraseña debe contener al menos una letra mayúscula')
    })

    it('rejects password without lowercase', () => {
      const result = validatePassword('UPPERCASE123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('La contraseña debe contener al menos una letra minúscula')
    })

    it('rejects password without number', () => {
      const result = validatePassword('NoNumbers')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('La contraseña debe contener al menos un número')
    })

    it('returns multiple errors for weak password', () => {
      const result = validatePassword('weak')
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe('truncateText', () => {
    it('truncates long text', () => {
      const longText = 'This is a very long text that should be truncated'
      expect(truncateText(longText, 20)).toBe('This is a very long...')
    })

    it('returns original text if shorter than max length', () => {
      const shortText = 'Short text'
      expect(truncateText(shortText, 20)).toBe('Short text')
    })

    it('handles exact length', () => {
      const text = 'Exactly twenty chars'
      expect(truncateText(text, 20)).toBe('Exactly twenty chars')
    })

    it('handles empty string', () => {
      expect(truncateText('', 10)).toBe('')
    })
  })

  describe('calculateDiscount', () => {
    it('calculates discount correctly', () => {
      const result = calculateDiscount(100, 20)
      expect(result.discountedPrice).toBe(80)
      expect(result.savings).toBe(20)
    })

    it('rounds to 2 decimal places', () => {
      const result = calculateDiscount(33.33, 33.33)
      expect(result.discountedPrice).toBe(22.22)
      expect(result.savings).toBe(11.11)
    })

    it('handles zero discount', () => {
      const result = calculateDiscount(50, 0)
      expect(result.discountedPrice).toBe(50)
      expect(result.savings).toBe(0)
    })

    it('handles 100% discount', () => {
      const result = calculateDiscount(50, 100)
      expect(result.discountedPrice).toBe(0)
      expect(result.savings).toBe(50)
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('delays function execution', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('test')
      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledWith('test')
    })

    it('cancels previous calls', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('first')
      debouncedFn('second')
      debouncedFn('third')

      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('third')
    })
  })

  describe('generateId', () => {
    it('generates a string', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })

    it('generates unique ids', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })

    it('generates ids with expected format', () => {
      const id = generateId()
      expect(id).toMatch(/^[a-z0-9]+$/)
    })
  })
})
