import { DB_VERSION, STORAGE_KEYS } from '../config.js'
import { createSeedDB } from '../data/seed.js'

export class StorageError extends Error {
  constructor(message, code = 'STORAGE_ERROR', cause) {
    super(message)
    this.name = 'StorageError'
    this.code = code
    this.cause = cause
  }
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidDB(value) {
  return (
    isPlainObject(value) &&
    value.version === DB_VERSION &&
    Array.isArray(value.products) &&
    Array.isArray(value.categories)
  )
}

export function readJSON(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    const isQuotaError =
      error?.name === 'QuotaExceededError' ||
      error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error?.code === 22 ||
      error?.code === 1014
    if (isQuotaError) {
      throw new StorageError(
        'Armazenamento do navegador cheio. Remova imagens ou produtos para continuar.',
        'QUOTA_EXCEEDED',
        error,
      )
    }
    throw new StorageError('Não foi possível salvar os dados no navegador.', 'WRITE_FAILED', error)
  }
}

export function getDB() {
  const stored = readJSON(STORAGE_KEYS.db, null)
  if (isValidDB(stored)) {
    return stored
  }
  const seed = createSeedDB()
  writeJSON(STORAGE_KEYS.db, seed)
  return seed
}

export function saveDB(db) {
  const next = { ...db, version: DB_VERSION, updatedAt: new Date().toISOString() }
  writeJSON(STORAGE_KEYS.db, next)
  return next
}

export function resetDB() {
  const seed = createSeedDB()
  writeJSON(STORAGE_KEYS.db, seed)
  return seed
}
