import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '../config.js'
import {
  addToCart,
  getCartCount,
  removeFromCart,
  setCartQuantity,
} from '../lib/cart.js'
import { readJSON, writeJSON } from '../lib/storage.js'
import { useCatalog } from './CatalogContext.jsx'

const CartContext = createContext(null)

function loadCart() {
  const stored = readJSON(STORAGE_KEYS.cart, [])
  if (!Array.isArray(stored)) {
    return []
  }
  return stored
    .filter(
      (item) =>
        item &&
        typeof item.productId === 'string' &&
        Number.isFinite(Number(item.qty)) &&
        Number(item.qty) > 0,
    )
    .map((item) => ({ productId: item.productId, qty: Math.trunc(Number(item.qty)) }))
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const { products } = useCatalog()

  useEffect(() => {
    try {
      writeJSON(STORAGE_KEYS.cart, items)
    } catch {
      /* o carrinho continua em memoria */
    }
  }, [items])

  const addItem = useCallback((product, quantity = 1) => {
    setItems((current) => addToCart(current, product.id, quantity, product.stock))
  }, [])

  const updateQuantity = useCallback((productId, quantity, stock) => {
    setItems((current) => setCartQuantity(current, productId, quantity, stock))
  }, [])

  const removeItem = useCallback((productId) => {
    setItems((current) => removeFromCart(current, productId))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const validItems = useMemo(() => {
    const productMap = new Map(products.map((product) => [product.id, product]))
    return items
      .map((item) => {
        const product = productMap.get(item.productId)
        if (!product) {
          return null
        }
        const available = Math.max(0, Math.trunc(Number(product.stock) || 0))
        return available > 0
          ? { productId: item.productId, qty: Math.min(item.qty, available) }
          : null
      })
      .filter(Boolean)
  }, [items, products])

  const count = useMemo(() => getCartCount(validItems), [validItems])

  const value = useMemo(
    () => ({ items: validItems, count, addItem, updateQuantity, removeItem, clearCart }),
    [validItems, count, addItem, updateQuantity, removeItem, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider')
  }
  return context
}
