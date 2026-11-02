import { describe, expect, it } from 'vitest'
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  fetchCatalog,
  resetCatalog,
  updateProduct,
  ValidationError,
} from '../../src/lib/api.js'
import { getDB } from '../../src/lib/storage.js'

const validProduct = {
  name: 'Produto de Teste',
  description: 'Descricao do produto de teste',
  priceCents: 19990,
  stock: 3,
  categoryId: 'eletronicos',
  image: 'https://images.unsplash.com/photo-1?auto=format',
  featured: false,
}

describe('api simulada', () => {
  it('carrega o catalogo inicial', async () => {
    const catalog = await fetchCatalog()
    expect(catalog.products.length).toBeGreaterThan(0)
    expect(catalog.categories).toContainEqual(
      expect.objectContaining({ id: 'eletronicos' }),
    )
  })

  it('valida dados ao criar produto', async () => {
    await expect(createProduct({ ...validProduct, name: '' })).rejects.toBeInstanceOf(
      ValidationError,
    )
    await expect(createProduct({ ...validProduct, priceCents: 0 })).rejects.toBeInstanceOf(
      ValidationError,
    )
    await expect(
      createProduct({ ...validProduct, image: 'javascript:alert(1)' }),
    ).rejects.toBeInstanceOf(ValidationError)
    await expect(
      createProduct({ ...validProduct, image: 'http://example.com/image.png' }),
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejeita valores numericos ambiguos ou fracionarios', async () => {
    await expect(createProduct({ ...validProduct, stock: '' })).rejects.toBeInstanceOf(
      ValidationError,
    )
    await expect(createProduct({ ...validProduct, stock: 2.5 })).rejects.toBeInstanceOf(
      ValidationError,
    )
    await expect(createProduct({ ...validProduct, stock: true })).rejects.toBeInstanceOf(
      ValidationError,
    )
    await expect(createProduct({ ...validProduct, priceCents: 19.99 })).rejects.toBeInstanceOf(
      ValidationError,
    )
  })

  it('cria, atualiza e exclui produto', async () => {
    const product = await createProduct(validProduct)
    expect(product.id).toMatch(/^p-/)
    expect(getDB().products.some((item) => item.id === product.id)).toBe(true)

    const updated = await updateProduct(product.id, {
      ...validProduct,
      name: 'Produto Atualizado',
      priceCents: 25990,
    })
    expect(updated.name).toBe('Produto Atualizado')
    expect(updated.priceCents).toBe(25990)

    await deleteProduct(product.id)
    expect(getDB().products.some((item) => item.id === product.id)).toBe(false)
  })

  it('cria categoria e impede exclusao quando possui produtos', async () => {
    const category = await createCategory('Categoria Teste')
    expect(category.slug).toBe('categoria-teste')

    await expect(deleteCategory('eletronicos')).rejects.toMatchObject({
      code: 'CATEGORY_IN_USE',
    })

    await deleteCategory(category.id)
    expect(getDB().categories.some((item) => item.id === category.id)).toBe(false)
  })

  it('restaura o catalogo demo', async () => {
    await deleteProduct('p-fone-bluetooth')
    const restored = await resetCatalog()
    expect(restored.products.some((item) => item.id === 'p-fone-bluetooth')).toBe(true)
  })
})
