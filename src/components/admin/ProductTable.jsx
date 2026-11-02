import { useMemo } from 'react'
import { formatBRL } from '../../lib/format.js'
import { Icon } from '../ui/Icon.jsx'
import { ProductImage } from '../ui/ProductImage.jsx'

export function ProductTable({ products, categories, onEdit, onDelete }) {
  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )

  return (
    <div className="table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">Produto</th>
            <th scope="col">Categoria</th>
            <th scope="col">Preço</th>
            <th scope="col">Estoque</th>
            <th scope="col">Destaque</th>
            <th scope="col">Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <div className="table-product">
                  <ProductImage src={product.image} alt={product.name} className="thumb" />
                  <span>
                    <strong>{product.name}</strong>
                    <small>{product.description || 'Sem descrição'}</small>
                  </span>
                </div>
              </td>
              <td>{categoryMap.get(product.categoryId)?.name ?? 'Sem categoria'}</td>
              <td className="price">{formatBRL(product.priceCents)}</td>
              <td>
                <span className={`status-pill ${product.stock <= 0 ? 'is-out' : ''}`}>
                  {product.stock <= 0 ? 'Esgotado' : `${product.stock} un.`}
                </span>
              </td>
              <td>{product.featured ? 'Sim' : '-'}</td>
              <td>
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => onEdit(product)}
                  >
                    <Icon name="edit" size={14} />
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => onDelete(product)}
                    style={{ color: 'var(--danger)' }}
                  >
                    <Icon name="trash" size={14} />
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
