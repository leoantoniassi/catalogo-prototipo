import { useCallback, useEffect, useState } from 'react'

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase()
  return hash.startsWith('admin') ? 'admin' : 'catalog'
}

export function useHashRoute() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((nextRoute) => {
    window.location.hash = nextRoute === 'admin' ? '#/admin' : '#/'
  }, [])

  return { route, navigate }
}
