import { describe, expect, it } from 'vitest'
import {
  addToCart,
  getCartCount,
  getCartTotals,
  removeFromCart,
  setCartQuantity,
} from '../../src/lib/cart.js'

const products = [
  { id: 'p1', name: 'Produto 1', priceCents: 1000, stock: 5 },
  { id: 'p2', name: 'Produto 2', priceCents: 2500, stock: 2 },
]

describe('cart helpers', () => {
  it('adiciona, incrementa e respeita o estoque', () => {
    let items = addToCart([], 'p1', 2, 5)
    expect(items).toEqual([{ productId: 'p1', qty: 2 }])

    items = addToCart(items, 'p1', 10, 5)
    expect(items[0].qty).toBe(5)

    items = addToCart(items, 'p2', 1, 2)
    expect(getCartCount(items)).toBe(6)
  })

  it('nao adiciona produto sem estoque', () => {
    expect(addToCart([], 'p1', 1, 0)).toEqual([])
  })

  it('atualiza quantidade e remove ao zerar ou ficar sem estoque', () => {
    const items = [{ productId: 'p1', qty: 2 }]
    expect(setCartQuantity(items, 'p1', 4, 5)).toEqual([{ productId: 'p1', qty: 4 }])
    expect(setCartQuantity(items, 'p1', 0, 5)).toEqual([])
    expect(setCartQuantity(items, 'p1', 1, 0)).toEqual([])
  })

  it('remove itens', () => {
    const items = [
      { productId: 'p1', qty: 1 },
      { productId: 'p2', qty: 1 },
    ]
    expect(removeFromCart(items, 'p1')).toEqual([{ productId: 'p2', qty: 1 }])
  })

  it('calcula totais ignorando produtos inexistentes', () => {
    const items = [
      { productId: 'p1', qty: 2 },
      { productId: 'p2', qty: 1 },
      { productId: 'removido', qty: 9 },
    ]
    const totals = getCartTotals(items, products)
    expect(totals.itemCount).toBe(3)
    expect(totals.totalCents).toBe(4500)
    expect(totals.lineItems).toHaveLength(2)
  })

  it('limita os totais ao estoque atual e ignora itens sem estoque', () => {
    const items = [
      { productId: 'p1', qty: 9 },
      { productId: 'p2', qty: 1 },
      { productId: 'p3', qty: 2 },
    ]
    const totals = getCartTotals(items, [...products, { id: 'p3', priceCents: 500, stock: 0 }])
    expect(totals.itemCount).toBe(6)
    expect(totals.totalCents).toBe(7500)
    expect(totals.lineItems).toHaveLength(2)
  })
})
