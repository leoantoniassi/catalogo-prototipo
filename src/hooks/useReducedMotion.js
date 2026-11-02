import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(QUERY).matches : false,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY)
    const handler = (event) => setReduced(event.matches)
    mediaQuery.addEventListener?.('change', handler)
    return () => mediaQuery.removeEventListener?.('change', handler)
  }, [])

  return reduced
}
