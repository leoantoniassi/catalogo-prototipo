import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ADMIN_CREDENTIALS, LOGIN_LOCK_MS, STORAGE_KEYS } from '../../src/config.js'
import { AuthProvider, useAuth } from '../../src/context/AuthContext.jsx'

const NOW = new Date('2026-05-01T12:00:00.000Z')
const LOGIN_DELAY_MS = 260

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

function renderAuth() {
  return renderHook(() => useAuth(), { wrapper })
}

async function attemptLogin(result, email, password) {
  let response
  await act(async () => {
    const pending = result.current.login(email, password)
    await vi.advanceTimersByTimeAsync(LOGIN_DELAY_MS)
    response = await pending
  })
  return response
}

function writeSession(loggedAt, email = ADMIN_CREDENTIALS.email) {
  window.sessionStorage.setItem(STORAGE_KEYS.auth, JSON.stringify({ email, loggedAt }))
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('autentica credenciais validas e persiste a sessao', async () => {
    const { result } = renderAuth()
    expect(result.current.isAuthenticated).toBe(false)

    const response = await attemptLogin(
      result,
      `  ${ADMIN_CREDENTIALS.email.toUpperCase()} `,
      ADMIN_CREDENTIALS.password,
    )

    expect(response).toEqual({ ok: true })
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user.email).toBe(ADMIN_CREDENTIALS.email)

    const stored = JSON.parse(window.sessionStorage.getItem(STORAGE_KEYS.auth))
    expect(stored).toMatchObject({
      email: ADMIN_CREDENTIALS.email,
      loggedAt: new Date(NOW.getTime() + LOGIN_DELAY_MS).toISOString(),
    })
  })

  it('rejeita credenciais invalidas sem criar sessao', async () => {
    const { result } = renderAuth()

    const response = await attemptLogin(result, ADMIN_CREDENTIALS.email, 'senha-errada')

    expect(response.ok).toBe(false)
    expect(response.error).toMatch(/Restam 4 tentativa/)
    expect(result.current.isAuthenticated).toBe(false)
    expect(window.sessionStorage.getItem(STORAGE_KEYS.auth)).toBeNull()
  })

  it('bloqueia tentativas apos exceder o limite e libera apos o periodo', async () => {
    const { result } = renderAuth()

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      await attemptLogin(result, ADMIN_CREDENTIALS.email, 'senha-errada')
    }

    expect(result.current.lockedUntil).toBeGreaterThan(NOW.getTime())

    const blocked = await attemptLogin(
      result,
      ADMIN_CREDENTIALS.email,
      ADMIN_CREDENTIALS.password,
    )
    expect(blocked.ok).toBe(false)
    expect(blocked.error).toMatch(/Muitas tentativas/)
    expect(result.current.isAuthenticated).toBe(false)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(LOGIN_LOCK_MS)
    })
    expect(result.current.lockedUntil).toBe(0)

    const response = await attemptLogin(
      result,
      ADMIN_CREDENTIALS.email,
      ADMIN_CREDENTIALS.password,
    )
    expect(response).toEqual({ ok: true })
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('restaura uma sessao valida dentro do TTL', () => {
    writeSession(new Date(NOW.getTime() - 60 * 60 * 1000).toISOString())

    const { result } = renderAuth()

    expect(result.current.isAuthenticated).toBe(true)
  })

  it.each([
    ['expirada', new Date(NOW.getTime() - 9 * 60 * 60 * 1000).toISOString()],
    ['com data futura', new Date(NOW.getTime() + 5 * 60 * 1000).toISOString()],
  ])('descarta sessao %s', (_label, loggedAt) => {
    writeSession(loggedAt)

    const { result } = renderAuth()

    expect(result.current.isAuthenticated).toBe(false)
    expect(window.sessionStorage.getItem(STORAGE_KEYS.auth)).toBeNull()
  })
})
