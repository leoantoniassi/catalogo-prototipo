function normalizeQuantity(quantity) {
  const value = Math.trunc(Number(quantity))
  return Number.isFinite(value) && value > 0 ? value : 1
}

export function addToCart(items, productId, quantity = 1, stock = Number.POSITIVE_INFINITY) {
  const qty = normalizeQuantity(quantity)
  const limit = Number.isFinite(stock) ? Math.max(0, Math.trunc(stock)) : Number.POSITIVE_INFINITY
  if (limit === 0) {
    return items
  }

  const existing = items.find((item) => item.productId === productId)
  if (existing) {
    return items.map((item) =>
      item.productId === productId
        ? { ...item, qty: Math.min(item.qty + qty, limit) }
        : item,
    )
  }

  return [...items, { productId, qty: Math.min(qty, limit) }]
}

export function setCartQuantity(items, productId, quantity, stock = Number.POSITIVE_INFINITY) {
  const nextQuantity = Math.trunc(Number(quantity))
  const limit = Number.isFinite(stock) ? Math.max(0, Math.trunc(stock)) : Number.POSITIVE_INFINITY
  if (!Number.isFinite(nextQuantity) || nextQuantity <= 0 || limit === 0) {
    return items.filter((item) => item.productId !== productId)
  }

  return items.map((item) =>
    item.productId === productId ? { ...item, qty: Math.min(nextQuantity, limit) } : item,
  )
}

export function removeFromCart(items, productId) {
  return items.filter((item) => item.productId !== productId)
}

export function getCartCount(items) {
  return items.reduce((total, item) => total + item.qty, 0)
}

export function getCartDetails(items, products) {
  const productMap = new Map(products.map((product) => [product.id, product]))
  return items
    .map((item) => {
      const product = productMap.get(item.productId)
      const available = Math.max(0, Math.trunc(Number(product?.stock) || 0))
      const qty = Math.min(Math.max(0, Math.trunc(Number(item.qty) || 0)), available)
      if (!product || qty <= 0) {
        return null
      }
      return {
        product,
        qty,
        subtotalCents: product.priceCents * qty,
      }
    })
    .filter(Boolean)
}

export function getCartTotals(items, products) {
  const lineItems = getCartDetails(items, products)
  return {
    lineItems,
    itemCount: lineItems.reduce((total, item) => total + item.qty, 0),
    totalCents: lineItems.reduce((total, item) => total + item.subtotalCents, 0),
  }
}
