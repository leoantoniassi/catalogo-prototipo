import { formatBRL } from '../../lib/format.js'
import { ProductImage } from '../ui/ProductImage.jsx'
import { Icon } from '../ui/Icon.jsx'

export function ProductCard({ product, categoryName, index = 0, onOpen, onAdd }) {
  const isOutOfStock = product.stock <= 0

  return (
    <article className="product-card stagger-item" style={{ '--i': index }}>
      <button
        type="button"
        className="card-media"
        onClick={() => onOpen(product)}
        aria-label={`Ver detalhes de ${product.name}`}
      >
        <ProductImage src={product.image} alt={product.name} />
        <span className="card-badges">
          <span className="tag">{categoryName}</span>
          {product.featured ? (
            <span className="tag tag-featured">
              <Icon name="sparkles" size={12} />
              Destaque
            </span>
          ) : null}
        </span>
      </button>

      <div className="card-body">
        <span className="card-category">{categoryName}</span>
        <h3>
          <button type="button" className="card-title-button" onClick={() => onOpen(product)}>
            {product.name}
          </button>
        </h3>
        <p className="card-description">{product.description || 'Sem descrição cadastrada.'}</p>

        <div className="card-footer">
          <div>
            <span className="card-price price">{formatBRL(product.priceCents)}</span>
            <div className="stock-note">
              {isOutOfStock
                ? 'Esgotado'
                : product.stock <= 5
                  ? `Últimas ${product.stock} unidades`
                  : `${product.stock} em estoque`}
            </div>
          </div>
          <button
            type="button"
            className="card-add"
            onClick={() => onAdd(product, 1)}
            disabled={isOutOfStock}
            aria-label={`Adicionar ${product.name} ao carrinho`}
            title={isOutOfStock ? 'Produto esgotado' : 'Adicionar ao carrinho'}
          >
            <Icon name="plus" size={19} />
          </button>
        </div>
      </div>
    </article>
  )
}
