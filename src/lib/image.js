import {
  IMAGE_MAX_EDGE,
  IMAGE_QUALITY,
  MAX_COMPRESSED_IMAGE_BYTES,
  MAX_IMAGE_INPUT_BYTES,
} from '../config.js'

export class ImageError extends Error {
  constructor(message, code = 'IMAGE_ERROR') {
    super(message)
    this.name = 'ImageError'
    this.code = code
  }
}

const DATA_IMAGE_PATTERN = /^data:image\/(?:png|jpe?g|webp|gif);base64,[a-z0-9+/=\s]+$/i
const ALLOWED_FILE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export function isHttpImageUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return false
  }
  try {
    const url = new URL(value)
    return url.protocol === 'https:'
  } catch {
    return false
  }
}

export function isDataImageUrl(value) {
  return typeof value === 'string' && DATA_IMAGE_PATTERN.test(value)
}

export function isSafeImageSource(value) {
  return isHttpImageUrl(value) || isDataImageUrl(value)
}

export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'Selecione um arquivo de imagem.' }
  }
  if (!ALLOWED_FILE_TYPES.has(file.type)) {
    return { valid: false, error: 'Formato inválido. Use JPG, PNG, WebP ou GIF.' }
  }
  if (file.size > MAX_IMAGE_INPUT_BYTES) {
    return { valid: false, error: 'A imagem deve ter no máximo 5 MB.' }
  }
  return { valid: true, error: null }
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new ImageError('Não foi possível ler a imagem selecionada.', 'DECODE_FAILED'))
    }
    image.src = objectUrl
  })
}

function renderImage(image, maxEdge, quality) {
  const naturalWidth = image.naturalWidth || image.width
  const naturalHeight = image.naturalHeight || image.height
  if (!naturalWidth || !naturalHeight) {
    throw new ImageError('Imagem inválida.', 'INVALID_DIMENSIONS')
  }

  const scale = Math.min(1, maxEdge / Math.max(naturalWidth, naturalHeight))
  const width = Math.max(1, Math.round(naturalWidth * scale))
  const height = Math.max(1, Math.round(naturalHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    throw new ImageError('Seu navegador não suporta compressão de imagem.', 'CANVAS_UNAVAILABLE')
  }

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, width, height)

  let dataUrl = canvas.toDataURL('image/webp', quality)
  if (!dataUrl.startsWith('data:image/webp')) {
    dataUrl = canvas.toDataURL('image/jpeg', quality)
  }

  return { dataUrl, width, height }
}

function dataUrlBytes(dataUrl) {
  const base64 = dataUrl.split(',')[1] ?? ''
  return Math.ceil(base64.length * 0.75)
}

export async function compressImage(file, options = {}) {
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new ImageError(validation.error, 'INVALID_FILE')
  }

  const maxEdge = options.maxEdge ?? IMAGE_MAX_EDGE
  const quality = options.quality ?? IMAGE_QUALITY
  const maxBytes = options.maxBytes ?? MAX_COMPRESSED_IMAGE_BYTES
  const image = await loadImage(file)

  const attempts = [
    { edge: maxEdge, quality },
    { edge: Math.min(maxEdge, 640), quality: 0.65 },
    { edge: Math.min(maxEdge, 480), quality: 0.55 },
  ]

  let smallest = null
  for (const attempt of attempts) {
    const rendered = renderImage(image, attempt.edge, attempt.quality)
    const bytes = dataUrlBytes(rendered.dataUrl)
    if (!smallest || bytes < smallest.bytes) {
      smallest = { ...rendered, bytes }
    }
    if (bytes <= maxBytes) {
      return { ...rendered, bytes }
    }
  }

  if (smallest && smallest.bytes <= maxBytes * 1.5) {
    return smallest
  }

  throw new ImageError(
    'Não foi possível comprimir a imagem o suficiente. Tente um arquivo menor.',
    'TOO_LARGE',
  )
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function createPlaceholderImage(label = 'Produto') {
  const cleanLabel = String(label).trim()
  const initial = escapeXml(cleanLabel.charAt(0).toUpperCase() || 'P')
  const safeLabel = escapeXml(cleanLabel.slice(0, 26))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f766e"/><stop offset="1" stop-color="#14b8a6"/></linearGradient></defs><rect width="640" height="480" fill="url(#g)"/><circle cx="540" cy="60" r="150" fill="rgba(255,255,255,.12)"/><circle cx="80" cy="430" r="120" fill="rgba(0,0,0,.12)"/><text x="320" y="245" text-anchor="middle" font-family="system-ui, sans-serif" font-size="120" font-weight="800" fill="rgba(255,255,255,.9)">${initial}</text><text x="320" y="305" text-anchor="middle" font-family="system-ui, sans-serif" font-size="24" font-weight="600" fill="rgba(255,255,255,.85)">${safeLabel}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function resolveImageSource(source, label) {
  return isSafeImageSource(source) ? source : createPlaceholderImage(label)
}
