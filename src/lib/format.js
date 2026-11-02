import { LOCALE } from '../config.js'

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'BRL',
})

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatBRL(priceCents) {
  const value = Number.isFinite(Number(priceCents)) ? Number(priceCents) : 0
  return currencyFormatter.format(value / 100)
}

export function formatDate(isoDate) {
  const date = new Date(isoDate)
  return Number.isNaN(date.getTime()) ? '-' : dateFormatter.format(date)
}

export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function formatNumber(value) {
  return new Intl.NumberFormat(LOCALE).format(value)
}

export function parsePriceToCents(value) {
  const raw = String(value ?? '').trim()
  if (!raw) {
    return Number.NaN
  }
  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : /^\d{1,3}(\.\d{3})+$/.test(raw)
      ? raw.replace(/\./g, '')
      : raw
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : Number.NaN
}
