export const APP_NAME = 'Catálogo Demo'
export const APP_TAGLINE = 'Vitrine interativa para demonstrações'
export const CURRENCY = 'BRL'
export const LOCALE = 'pt-BR'

export const STORAGE_PREFIX = 'catalog:v1:'
export const STORAGE_KEYS = Object.freeze({
  db: `${STORAGE_PREFIX}db`,
  cart: `${STORAGE_PREFIX}cart`,
  theme: `${STORAGE_PREFIX}theme`,
  auth: `${STORAGE_PREFIX}auth`,
})

export const DB_VERSION = 1
export const API_LATENCY_MS = 120

export const ADMIN_CREDENTIALS = Object.freeze({
  email: 'admin@demo.com',
  password: 'admin123',
})

export const MAX_LOGIN_ATTEMPTS = 5
export const LOGIN_LOCK_MS = 30_000

export const WHATSAPP_NUMBER = '5511999999999'

export const MAX_IMAGE_INPUT_BYTES = 5 * 1024 * 1024
export const MAX_COMPRESSED_IMAGE_BYTES = 220 * 1024
export const IMAGE_MAX_EDGE = 800
export const IMAGE_QUALITY = 0.82

export const PRODUCT_NAME_MAX = 120
export const PRODUCT_DESCRIPTION_MAX = 1000
export const CATEGORY_NAME_MAX = 60
