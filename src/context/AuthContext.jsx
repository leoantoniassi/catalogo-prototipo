import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { LOGIN_LOCK_MS, MAX_LOGIN_ATTEMPTS, STORAGE_KEYS } from '../config.js'
import { verifyCredentials } from '../lib/auth.js'

const AuthContext = createContext(null)
const LOGIN_DELAY_MS = 260
const SESSION_TTL_MS = 8 * 60 * 60 * 1000

function readSession() {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEYS.auth)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    const loggedAt = Date.parse(parsed?.loggedAt)
    const now = Date.now()
    const expired =
      !Number.isFinite(loggedAt) ||
      loggedAt > now + 60_000 ||
      now - loggedAt > SESSION_TTL_MS
    if (typeof parsed?.email !== 'string' || expired) {
      clearSession()
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function saveSession(session) {
  try {
    window.sessionStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(session))
  } catch {
    /* sessão mantida apenas em memória */
  }
}

function clearSession() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEYS.auth)
  } catch {
    /* ignora */
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession)
  const [lockedUntil, setLockedUntil] = useState(0)
  const lockedUntilRef = useRef(0)
  const attemptsRef = useRef(0)
  const lockTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current)
      }
    }
  }, [])

  const login = useCallback(
    async (email, password) => {
      const now = Date.now()
      if (lockedUntilRef.current > now) {
        const seconds = Math.ceil((lockedUntilRef.current - now) / 1000)
        return { ok: false, error: `Muitas tentativas. Tente novamente em ${seconds}s.` }
      }

      await new Promise((resolve) => setTimeout(resolve, LOGIN_DELAY_MS))

      if (lockedUntilRef.current > Date.now()) {
        const seconds = Math.ceil((lockedUntilRef.current - Date.now()) / 1000)
        return { ok: false, error: `Muitas tentativas. Tente novamente em ${seconds}s.` }
      }

      if (verifyCredentials(email, password)) {
        attemptsRef.current = 0
        lockedUntilRef.current = 0
        setLockedUntil(0)
        const session = {
          email: String(email).trim().toLowerCase(),
          loggedAt: new Date().toISOString(),
        }
        saveSession(session)
        setUser(session)
        return { ok: true }
      }

      attemptsRef.current += 1
      if (attemptsRef.current >= MAX_LOGIN_ATTEMPTS) {
        attemptsRef.current = 0
        const until = Date.now() + LOGIN_LOCK_MS
        lockedUntilRef.current = until
        setLockedUntil(until)
        if (lockTimerRef.current) {
          clearTimeout(lockTimerRef.current)
        }
        const lockSeconds = Math.ceil(LOGIN_LOCK_MS / 1000)
        lockTimerRef.current = setTimeout(() => {
          lockedUntilRef.current = 0
          setLockedUntil(0)
        }, LOGIN_LOCK_MS)
        return {
          ok: false,
          error: `Muitas tentativas inválidas. Aguarde ${lockSeconds} segundos para tentar novamente.`,
        }
      }

      const remaining = MAX_LOGIN_ATTEMPTS - attemptsRef.current
      return {
        ok: false,
        error: `Credenciais inválidas. Restam ${remaining} tentativa(s).`,
      }
    },
    [],
  )

  const logout = useCallback(() => {
    attemptsRef.current = 0
    lockedUntilRef.current = 0
    setLockedUntil(0)
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, logout, lockedUntil }),
    [user, login, logout, lockedUntil],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
