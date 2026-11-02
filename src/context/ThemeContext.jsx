import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { STORAGE_KEYS } from '../config.js'

const ThemeContext = createContext(null)

function getStoredTheme() {
  try {
    return window.localStorage.getItem(STORAGE_KEYS.theme)
  } catch {
    return null
  }
}

function getInitialTheme() {
  const stored = getStoredTheme()
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)
  const manualRef = useRef(getStoredTheme() === 'light' || getStoredTheme() === 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    const themeColor = document.querySelector('meta[name="theme-color"]')
    themeColor?.setAttribute('content', theme === 'dark' ? '#0a1117' : '#0f766e')
    if (manualRef.current) {
      try {
        window.localStorage.setItem(STORAGE_KEYS.theme, theme)
      } catch {
        /* preferencia mantida apenas em memoria */
      }
    }
  }, [theme])

  useEffect(() => {
    if (manualRef.current) {
      return undefined
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (event) => {
      if (!manualRef.current) {
        setTheme(event.matches ? 'dark' : 'light')
      }
    }
    mediaQuery.addEventListener?.('change', handler)
    return () => mediaQuery.removeEventListener?.('change', handler)
  }, [])

  const toggleTheme = useCallback(() => {
    manualRef.current = true
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(
    () => ({ theme, isDark: theme === 'dark', toggleTheme }),
    [theme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  }
  return context
}
