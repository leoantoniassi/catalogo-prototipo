import {
  API_LATENCY_MS,
  CATEGORY_NAME_MAX,
  MAX_COMPRESSED_IMAGE_BYTES,
  PRODUCT_DESCRIPTION_MAX,
  PRODUCT_NAME_MAX,
} from '../config.js'
import { getDB, resetDB, saveDB } from './storage.js'
import { isSafeImageSource } from './image.js'
import { slugify } from './format.js'

export class ValidationError extends Error {
  constructor(fieldErrors, message = 'Revise os campos destacados.') {
    super(message)
    this.name = 'ValidationError'
    this.fieldErrors = fieldErrors
  }
}

export class ApiError extends Error {
  constructor(message, code = 'API_ERROR') {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

const wait = (ms = API_LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms))

function createId(prefix) {
  const random =
    globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 12)
  return `${prefix}-${random}`
}

function textValue(value) {
  return String(value ?? '').trim()
}

function integerValue(value) {
  if (typeof value === 'boolean' || value === null || value === undefined || value === '') {
    return Number.NaN
  }
  const number = Number(value)
  return Number.isFinite(number) && Number.isInteger(number) ? number : Number.NaN
}

export function validateProductInput(input, categories) {
  const fieldErrors = {}
  const name = textValue(input.name)
  const description = textValue(input.description)
  const priceCents = integerValue(input.priceCents)
  const stock = integerValue(input.stock ?? 0)
  const categoryId = textValue(input.categoryId)
  const image = textValue(input.image)

  if (!name) {
    fieldErrors.name = 'Informe o nome do produto.'
  } else if (name.length > PRODUCT_NAME_MAX) {
    fieldErrors.name = `O nome deve ter no máximo ${PRODUCT_NAME_MAX} caracteres.`
  }

  if (description.length > PRODUCT_DESCRIPTION_MAX) {
    fieldErrors.description = `A descrição deve ter no máximo ${PRODUCT_DESCRIPTION_MAX} caracteres.`
  }

  if (!Number.isFinite(priceCents) || priceCents <= 0) {
    fieldErrors.priceCents = 'Informe um preço maior que zero.'
  } else if (priceCents > 100_000_000) {
    fieldErrors.priceCents = 'O preço informado é muito alto.'
  }

  if (!Number.isFinite(stock) || stock < 0) {
    fieldErrors.stock = 'O estoque não pode ser negativo.'
  } else if (stock > 999_999) {
    fieldErrors.stock = 'O estoque informado é muito alto.'
  }

  if (!categories.some((category) => category.id === categoryId)) {
    fieldErrors.categoryId = 'Selecione uma categoria válida.'
  }

  if (image && !isSafeImageSource(image)) {
    fieldErrors.image = 'Use uma URL https válida ou envie um arquivo de imagem.'
  } else if (image.startsWith('data:')) {
    const base64 = image.split(',')[1] ?? ''
    const bytes = Math.ceil(base64.length * 0.75)
    if (bytes > MAX_COMPRESSED_IMAGE_BYTES * 1.5) {
      fieldErrors.image = 'A imagem é muito grande. Envie um arquivo menor.'
    }
  } else if (image.length > 2048) {
    fieldErrors.image = 'A URL da imagem é muito longa.'
  }

  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
    values: {
      name,
      description,
      priceCents,
      stock,
      categoryId,
      image: image && isSafeImageSource(image) ? image : '',
      featured: Boolean(input.featured),
    },
  }
}

function validateCategoryName(name, categories, currentId = null) {
  const cleanName = textValue(name)
  if (!cleanName) {
    return { error: 'Informe o nome da categoria.' }
  }
  if (cleanName.length > CATEGORY_NAME_MAX) {
    return { error: `O nome deve ter no máximo ${CATEGORY_NAME_MAX} caracteres.` }
  }
  const normalized = slugify(cleanName)
  const duplicate = categories.some(
    (category) => category.id !== currentId && (category.slug === normalized || slugify(category.name) === normalized),
  )
  if (duplicate) {
    return { error: 'Já existe uma categoria com esse nome.' }
  }
  return { value: cleanName, slug: normalized }
}

export async function fetchCatalog() {
  await wait()
  const db = getDB()
  return { products: db.products, categories: db.categories }
}

export async function createProduct(input) {
  await wait(80)
  const db = getDB()
  const validation = validateProductInput(input, db.categories)
  if (!validation.valid) {
    throw new ValidationError(validation.fieldErrors)
  }

  const now = new Date().toISOString()
  const product = {
    id: createId('p'),
    ...validation.values,
    createdAt: now,
    updatedAt: now,
  }

  saveDB({ ...db, products: [product, ...db.products] })
  return product
}

export async function updateProduct(id, input) {
  await wait(80)
  const db = getDB()
  const current = db.products.find((product) => product.id === id)
  if (!current) {
    throw new ApiError('Produto não encontrado.', 'NOT_FOUND')
  }

  const validation = validateProductInput(input, db.categories)
  if (!validation.valid) {
    throw new ValidationError(validation.fieldErrors)
  }

  const product = {
    ...current,
    ...validation.values,
    updatedAt: new Date().toISOString(),
  }

  saveDB({
    ...db,
    products: db.products.map((item) => (item.id === id ? product : item)),
  })
  return product
}

export async function deleteProduct(id) {
  await wait(80)
  const db = getDB()
  if (!db.products.some((product) => product.id === id)) {
    throw new ApiError('Produto não encontrado.', 'NOT_FOUND')
  }
  saveDB({ ...db, products: db.products.filter((product) => product.id !== id) })
  return id
}

export async function createCategory(name) {
  await wait(80)
  const db = getDB()
  const validation = validateCategoryName(name, db.categories)
  if (validation.error) {
    throw new ValidationError({ category: validation.error })
  }

  const category = {
    id: validation.slug || createId('c'),
    name: validation.value,
    slug: validation.slug,
  }

  if (db.categories.some((item) => item.id === category.id)) {
    throw new ValidationError({ category: 'Já existe uma categoria com esse nome.' })
  }

  saveDB({ ...db, categories: [...db.categories, category] })
  return category
}

export async function updateCategory(id, name) {
  await wait(80)
  const db = getDB()
  const current = db.categories.find((category) => category.id === id)
  if (!current) {
    throw new ApiError('Categoria não encontrada.', 'NOT_FOUND')
  }

  const validation = validateCategoryName(name, db.categories, id)
  if (validation.error) {
    throw new ValidationError({ category: validation.error })
  }

  const category = { ...current, name: validation.value, slug: validation.slug }
  saveDB({
    ...db,
    categories: db.categories.map((item) => (item.id === id ? category : item)),
  })
  return category
}

export async function deleteCategory(id) {
  await wait(80)
  const db = getDB()
  if (!db.categories.some((category) => category.id === id)) {
    throw new ApiError('Categoria não encontrada.', 'NOT_FOUND')
  }
  if (db.products.some((product) => product.categoryId === id)) {
    throw new ApiError(
      'Não é possível excluir uma categoria que possui produtos. Mova ou exclua os produtos primeiro.',
      'CATEGORY_IN_USE',
    )
  }
  saveDB({ ...db, categories: db.categories.filter((category) => category.id !== id) })
  return id
}

export async function resetCatalog() {
  await wait()
  const db = resetDB()
  return { products: db.products, categories: db.categories }
}
