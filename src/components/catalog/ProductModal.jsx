import { useState } from 'react'
import { formatBRL } from '../../lib/format.js'
import { Modal } from '../ui/Modal.jsx'
import { ProductImage } from '../ui/ProductImage.jsx'
import { Icon } from '../ui/Icon.jsx'

export function ProductModal({ product, categoryName, onClose, onAdd }) {
  const [quantity, setQuantity] = useState(1)
  const isOutOfStock = product.stock <= 0
  const maxQuantity = Math.max(1, product.stock)

  return (
    <Modal open onClose={onClose} title="Detalhes do produto">
      <div className="detail-grid">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="detail-image"
          loading="eager"
        />

        <div className="detail-info">
          <span className="card-category">{categoryName}</span>
          <h3 style={{ fontSize: '1.45rem' }}>{product.name}</h3>
          <span className="detail-price price">{formatBRL(product.priceCents)}</span>
          <p className="detail-description">
            {product.description || 'Sem descrição cadastrada.'}
          </p>

          <div className="stock-note">
            {isOutOfStock
              ? 'Produto esgotado'
              : product.stock <= 5
                ? `Últimas ${product.stock} unidades em estoque`
                : `${product.stock} unidades em estoque`}
          </div>

          <div className="detail-actions">
            <div className="qty-control" aria-label="Quantidade">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                disabled={quantity <= 1}
                aria-label="Diminuir quantidade"
              >
                <Icon name="minus" size={16} />
              </button>
              <span aria-live="polite">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
                disabled={quantity >= maxQuantity}
                aria-label="Aumentar quantidade"
              >
                <Icon name="plus" size={16} />
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onAdd(product, quantity)}
              disabled={isOutOfStock}
            >
              <Icon name="cart" size={17} />
              {isOutOfStock ? 'Esgotado' : 'Adicionar ao carrinho'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
