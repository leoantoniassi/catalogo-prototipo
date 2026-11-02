import { describe, expect, it } from 'vitest'
import { filterAndSortProducts } from '../../src/lib/catalog.js'

const products = [
  {
    id: '1',
    name: 'Óculos de Sol',
    description: 'Lentes polarizadas',
    priceCents: 15990,
    categoryId: 'moda',
    featured: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Fone Bluetooth',
    description: 'Cancelamento de ruído',
    priceCents: 29990,
    categoryId: 'eletronicos',
    featured: true,
    createdAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Caneca Térmica',
    description: 'Inox 750 ml',
    priceCents: 5990,
    categoryId: 'casa',
    featured: false,
    createdAt: '2026-03-01T00:00:00.000Z',
  },
]

describe('filterAndSortProducts', () => {
  it('busca ignorando acentos e maiusculas', () => {
    const result = filterAndSortProducts(products, { query: 'oculos' })
    expect(result.map((product) => product.id)).toEqual(['1'])
  })

  it('filtra por categoria', () => {
    const result = filterAndSortProducts(products, { categoryId: 'casa' })
    expect(result.map((product) => product.id)).toEqual(['3'])
  })

  it('ordena por preco crescente e decrescente', () => {
    expect(
      filterAndSortProducts(products, { sort: 'price-asc' }).map((product) => product.id),
    ).toEqual(['3', '1', '2'])
    expect(
      filterAndSortProducts(products, { sort: 'price-desc' }).map((product) => product.id),
    ).toEqual(['2', '1', '3'])
  })

  it('coloca destaques primeiro na ordenacao padrao', () => {
    expect(filterAndSortProducts(products).map((product) => product.id)).toEqual(['2', '3', '1'])
  })

  it('ordena por mais recentes', () => {
    expect(
      filterAndSortProducts(products, { sort: 'newest' }).map((product) => product.id),
    ).toEqual(['3', '2', '1'])
  })
})
