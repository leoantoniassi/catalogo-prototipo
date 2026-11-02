import { ProductCard } from './ProductCard.jsx'

export function ProductGrid({ products, categoryMap, onOpen, onAdd }) {
  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryName={categoryMap.get(product.categoryId)?.name ?? 'Sem categoria'}
          index={index}
          onOpen={onOpen}
          onAdd={onAdd}
        />
      ))}
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="product-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton skeleton-media" />
          <div className="skeleton-body">
            <div className="skeleton skeleton-line w-40" />
            <div className="skeleton skeleton-line w-70" />
            <div className="skeleton skeleton-line w-40" />
          </div>
        </div>
      ))}
    </div>
  )
}
