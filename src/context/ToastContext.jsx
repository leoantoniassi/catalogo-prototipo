import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const ToastContext = createContext(null)
let toastCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const dismissToast = useCallback((id) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback(
    (message, type = 'info', duration = 3400) => {
      const id = `toast-${++toastCounter}`
      setToasts((current) => [...current.slice(-3), { id, message, type }])
      const timer = setTimeout(() => {
        timersRef.current.delete(id)
        setToasts((current) => current.filter((toast) => toast.id !== id))
      }, duration)
      timersRef.current.set(id, timer)
      return id
    },
    [],
  )

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, pushToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider')
  }
  return context
}
