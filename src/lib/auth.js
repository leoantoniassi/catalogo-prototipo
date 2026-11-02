import { ADMIN_CREDENTIALS } from '../config.js'

export function verifyCredentials(email, password) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase()
  return (
    normalizedEmail === ADMIN_CREDENTIALS.email.toLowerCase() &&
    String(password ?? '') === ADMIN_CREDENTIALS.password
  )
}
