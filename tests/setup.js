import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

function createMatchMedia(query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }
}

beforeEach(() => {
  window.localStorage.clear()
  window.sessionStorage.clear()
  window.location.hash = ''
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn((query) => createMatchMedia(query)),
  })
  window.scrollTo = vi.fn()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
