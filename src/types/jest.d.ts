import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(...classes: string[]): R;
      toHaveValue(value: string | number | string[]): R;
      toBeDisabled(): R;
      toContainHTML(htmlText: string): R;
      toContainElement(element: Element | null): R;
    }
  }
}

export {};