import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { STORAGE_KEYS } from '../../src/config.js'
import { ThemeProvider, useTheme } from '../../src/context/ThemeContext.jsx'

function mockMatchMedia(matches) {
  const listeners = new Set()
  const mediaQuery = {
    matches,
    media: '(prefers-color-scheme: dark)',
    addEventListener: vi.fn((type, listener) => {
      if (type === 'change') {
        listeners.add(listener)
      }
    }),
    removeEventListener: vi.fn((type, listener) => {
      if (type === 'change') {
        listeners.delete(listener)
      }
    }),
    dispatch(matchesNext) {
      mediaQuery.matches = matchesNext
      listeners.forEach((listener) => listener({ matches: matchesNext }))
    },
  }
  window.matchMedia = vi.fn(() => mediaQuery)
  return mediaQuery
}

function wrapper({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

describe('ThemeContext', () => {
  it('segue a preferencia do sistema enquanto nao houver escolha manual', () => {
    const mediaQuery = mockMatchMedia(false)
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('light')

    act(() => mediaQuery.dispatch(true))

    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('nao permite que o sistema sobrescreva a escolha manual em tempo de execucao', () => {
    const mediaQuery = mockMatchMedia(false)
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('dark')

    act(() => mediaQuery.dispatch(false))

    expect(result.current.theme).toBe('dark')
    expect(window.localStorage.getItem(STORAGE_KEYS.theme)).toBe('dark')
  })

  it('respeita a preferencia manual persistida e nao assina o sistema', () => {
    window.localStorage.setItem(STORAGE_KEYS.theme, 'dark')
    const mediaQuery = mockMatchMedia(false)

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('dark')
    expect(mediaQuery.addEventListener).not.toHaveBeenCalled()
  })
})
