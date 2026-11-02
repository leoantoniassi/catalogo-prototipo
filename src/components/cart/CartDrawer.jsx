import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { APP_NAME, WHATSAPP_NUMBER } from '../../config.js'
import { useCart } from '../../context/CartContext.jsx'
import { useCatalog } from '../../context/CatalogContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getCartTotals } from '../../lib/cart.js'
import { formatBRL } from '../../lib/format.js'
import { buildWhatsAppMessage, buildWhatsAppUrl } from '../../lib/whatsapp.js'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock.js'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import { Icon } from '../ui/Icon.jsx'
import { ProductImage } from '../ui/ProductImage.jsx'

export function CartDrawer({ open, onClose }) {
  const { items, updateQuantity, removeItem, clearCart } = useCart()
  const { products } = useCatalog()
  const { pushToast } = useToast()
  const drawerRef = useRef(null)

  useBodyScrollLock(open)
  useFocusTrap(drawerRef, open)

  useEffect(() => {
    if (!open) {
      return undefined
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) {
    return null
  }

  const totals = getCartTotals(items, products)

  const handleCheckout = () => {
    const message = buildWhatsAppMessage({
      lineItems: totals.lineItems,
      totalCents: totals.totalCents,
      appName: APP_NAME,
    })
    const url = buildWhatsAppUrl({ phone: WHATSAPP_NUMBER, message })
    if (!url) {
      pushToast('Número de WhatsApp inválido. Ajuste em src/config.js.', 'error')
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
    pushToast('Abrindo o WhatsApp com o resumo do pedido.', 'info')
  }

  const handleClear = () => {
    clearCart()
    pushToast('Carrinho esvaziado.', 'info')
  }

  return createPortal(
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        ref={drawerRef}
        tabIndex={-1}
      >
        <div className="drawer-header">
          <h2 id="cart-title">
            <Icon name="cart" size={19} />
            Seu carrinho
            <span className="muted" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
              ({totals.itemCount})
            </span>
          </h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar carrinho">
            <Icon name="close" size={18} />
          </button>
        </div>

        {totals.lineItems.length === 0 ? (
          <div className="cart-list">
            <div className="empty-state" style={{ border: 0, background: 'transparent' }}>
              <span className="empty-icon">
                <Icon name="cart" size={26} />
              </span>
              <h3>Seu carrinho está vazio</h3>
              <p>Explore a vitrine e adicione produtos para simular um pedido.</p>
              <button type="button" className="btn btn-primary" onClick={onClose}>
                Explorar produtos
              </button>
            </div>
          </div>
        ) : (
          <ul className="cart-list">
            {totals.lineItems.map(({ product, qty, subtotalCents }) => (
              <li key={product.id} className="cart-item">
                <ProductImage src={product.image} alt={product.name} className="cart-thumb" />
                <div className="cart-item-info">
                  <h3>{product.name}</h3>
                  <p>{formatBRL(product.priceCents)} cada</p>
                  <div className="qty-control" style={{ marginTop: 6 }}>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(product.id, qty - 1, product.stock)
                      }
                      aria-label={`Diminuir quantidade de ${product.name}`}
                    >
                      <Icon name="minus" size={13} />
                    </button>
                    <span>{qty}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, qty + 1, product.stock)}
                      disabled={qty >= product.stock}
                      aria-label={`Aumentar quantidade de ${product.name}`}
                    >
                      <Icon name="plus" size={13} />
                    </button>
                  </div>
                </div>
                <div className="cart-item-actions">
                  <span className="cart-item-total">{formatBRL(subtotalCents)}</span>
                  <button
                    type="button"
                    className="cart-remove"
                    onClick={() => {
                      removeItem(product.id)
                      pushToast(`${product.name} removido do carrinho.`, 'info')
                    }}
                    aria-label={`Remover ${product.name} do carrinho`}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="cart-summary">
          <div className="cart-line">
            <span>Itens</span>
            <span>{totals.itemCount}</span>
          </div>
          <div className="cart-line">
            <span>Frete</span>
            <span>A combinar</span>
          </div>
          <div className="cart-line cart-total">
            <span>Total</span>
            <span className="price">{formatBRL(totals.totalCents)}</span>
          </div>
        </div>

        <div className="drawer-footer">
          <button
            type="button"
            className="btn btn-whatsapp btn-block"
            onClick={handleCheckout}
            disabled={totals.lineItems.length === 0}
          >
            <Icon name="chat" size={18} />
            Finalizar no WhatsApp
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-block btn-sm"
            onClick={handleClear}
            disabled={totals.lineItems.length === 0}
          >
            Limpar carrinho
          </button>
          <p className="cart-hint">Checkout simulado via WhatsApp. Número de exemplo.</p>
        </div>
      </aside>
    </>,
    document.body,
  )
}
