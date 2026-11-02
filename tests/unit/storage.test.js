import { describe, expect, it, vi } from 'vitest'
import {
  getDB,
  readJSON,
  resetDB,
  saveDB,
  StorageError,
  writeJSON,
} from '../../src/lib/storage.js'
import { STORAGE_KEYS } from '../../src/config.js'

describe('storage', () => {
  it('cria o banco inicial com seed na primeira carga', () => {
    const db = getDB()
    expect(db.version).toBe(1)
    expect(db.products.length).toBeGreaterThan(0)
    expect(db.categories.length).toBeGreaterThan(0)
    expect(readJSON(STORAGE_KEYS.db)).not.toBeNull()
  })

  it('le e grava JSON', () => {
    writeJSON('teste', { ok: true })
    expect(readJSON('teste')).toEqual({ ok: true })
    expect(readJSON('inexistente', 'fallback')).toBe('fallback')
  })

  it('recupera seed quando o JSON esta corrompido', () => {
    window.localStorage.setItem(STORAGE_KEYS.db, '{quebrado')
    const db = getDB()
    expect(db.products.length).toBeGreaterThan(0)
  })

  it('salva atualizacoes no banco', () => {
    const db = getDB()
    const next = saveDB({ ...db, products: db.products.slice(0, 1) })
    expect(next.updatedAt).toBeTruthy()
    expect(readJSON(STORAGE_KEYS.db).products).toHaveLength(1)
  })

  it('restaura os dados de demonstracao', () => {
    const db = getDB()
    saveDB({ ...db, products: [] })
    const restored = resetDB()
    expect(restored.products.length).toBeGreaterThan(0)
  })

  it('sinaliza quando o armazenamento esta cheio', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      const error = new Error('quota')
      error.name = 'QuotaExceededError'
      throw error
    })

    expect(() => writeJSON('teste', { value: 1 })).toThrow(StorageError)
    try {
      writeJSON('teste', { value: 1 })
    } catch (error) {
      expect(error.code).toBe('QUOTA_EXCEEDED')
    }
  })
})
