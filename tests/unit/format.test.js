import { describe, expect, it } from 'vitest'
import {
  formatBRL,
  formatDate,
  normalizeText,
  parsePriceToCents,
  slugify,
} from '../../src/lib/format.js'

describe('format helpers', () => {
  it('formata valores em BRL', () => {
    expect(formatBRL(29990)).toContain('299,90')
    expect(formatBRL(0)).toContain('0,00')
    expect(formatBRL(undefined)).toContain('0,00')
  })

  it('converte entrada de preco para centavos', () => {
    expect(parsePriceToCents('299,90')).toBe(29990)
    expect(parsePriceToCents('1.299,90')).toBe(129990)
    expect(parsePriceToCents('299.90')).toBe(29990)
    expect(parsePriceToCents('1.234')).toBe(123400)
    expect(parsePriceToCents('')).toBeNaN()
    expect(parsePriceToCents('abc')).toBeNaN()
  })

  it('normaliza texto sem acentos e em minusculas', () => {
    expect(normalizeText('  Óculos de Sol ')).toBe('oculos de sol')
    expect(normalizeText(undefined)).toBe('')
  })

  it('gera slugs seguros', () => {
    expect(slugify('Casa & Decoração')).toBe('casa-decoracao')
    expect(slugify('  Eletrônicos  ')).toBe('eletronicos')
  })

  it('formata datas validas e invalidas', () => {
    expect(formatDate('2026-01-01T00:00:00.000Z')).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    expect(formatDate('invalida')).toBe('-')
  })
})
