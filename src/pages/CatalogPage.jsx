import { useDeferredValue, useMemo, useState } from 'react'
import { APP_NAME, WHATSAPP_NUMBER } from '../config.js'
import { useCart } from '../context/CartContext.jsx'
import { useCatalog } from '../context/CatalogContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { filterAndSortProducts } from '../lib/catalog.js'
import { formatNumber } from '../lib/format.js'
import { CategoryFilter } from '../components/catalog/CategoryFilter.jsx'
import { ProductGrid, ProductGridSkeleton } from '../components/catalog/ProductGrid.jsx'
import { ProductModal } from '../components/catalog/ProductModal.jsx'
import { SearchBar } from '../components/catalog/SearchBar.jsx'
import { SortSelect } from '../components/catalog/SortSelect.jsx'
import { Icon } from '../components/ui/Icon.jsx'

const DEFAULT_FILTERS = { query: '', categoryId: 'all', sort: 'featured' }

export function CatalogPage() {
  const { products, categories, loading, error } = useCatalog()
  const { addItem } = useCart()
  const { pushToast } = useToast()

  const [query, setQuery] = useState(DEFAULT_FILTERS.query)
  const [categoryId, setCategoryId] = useState(DEFAULT_FILTERS.categoryId)
  const [sort, setSort] = useState(DEFAULT_FILTERS.sort)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const deferredQuery = useDeferredValue(query)

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )

  const filteredProducts = useMemo(
    () =>
      filterAndSortProducts(products, {
        query: deferredQuery,
        categoryId,
        sort,
      }),
    [products, deferredQuery, categoryId, sort],
  )

  const hasFilters =
    query.trim() !== '' || categoryId !== DEFAULT_FILTERS.categoryId || sort !== DEFAULT_FILTERS.sort

  const clearFilters = () => {
    setQuery(DEFAULT_FILTERS.query)
    setCategoryId(DEFAULT_FILTERS.categoryId)
    setSort(DEFAULT_FILTERS.sort)
  }

  const handleAdd = (product, quantity = 1) => {
    if (product.stock <= 0) {
      pushToast('Este produto está esgotado.', 'error')
      return
    }
    addItem(product, quantity)
    pushToast(`${product.name} adicionado ao carrinho.`, 'success')
  }

  const handleAddFromModal = (product, quantity) => {
    handleAdd(product, quantity)
    setSelectedProduct(null)
  }

  return (
    <main id="conteudo">
      <section className="hero">
        <div className="container">
          <div className="hero-panel animate-fade-up">
            <span className="hero-eyebrow">
              <Icon name="sparkles" size={14} />
              {APP_NAME}
            </span>
            <h1 className="hero-title">
              Descubra produtos <span>selecionados</span> para o seu dia a dia.
            </h1>
            <p className="hero-subtitle">
              Navegue pela vitrine, filtre por categoria, monte seu carrinho e finalize o pedido
              pelo WhatsApp. Um protótipo completo de catálogo online.
            </p>
            <div className="hero-stats">
              <span className="hero-stat">
                <strong>{loading ? '...' : formatNumber(products.length)}</strong> produtos
              </span>
              <span className="hero-stat">
                <strong>{loading ? '...' : formatNumber(categories.length)}</strong> categorias
              </span>
              <span className="hero-stat">
                <strong>100%</strong> responsivo
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="container catalog-section" aria-labelledby="vitrine-titulo">
        <h2 id="vitrine-titulo" className="visually-hidden">
          Vitrine de produtos
        </h2>

        {error ? (
          <div className="panel" style={{ marginTop: 26 }}>
            <div className="empty-state">
              <span className="empty-icon">
                <Icon name="alert" size={26} />
              </span>
              <h3>Não foi possível carregar o catálogo</h3>
              <p>{error}</p>
              <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
                <Icon name="refresh" size={16} />
                Recarregar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="toolbar">
              <SearchBar value={query} onChange={setQuery} />
              <div className="filters-row">
                <SortSelect value={sort} onChange={setSort} />
              </div>
            </div>

            <CategoryFilter
              categories={categories}
              activeId={categoryId}
              onChange={setCategoryId}
            />

            <div className="results-meta">
              <span aria-live="polite">
                {loading ? (
                  'Carregando produtos...'
                ) : (
                  <>
                    <strong>{filteredProducts.length}</strong>{' '}
                    {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                  </>
                )}
              </span>
              {hasFilters && !loading ? (
                <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>
                  Limpar filtros
                </button>
              ) : null}
            </div>

            {loading ? (
              <ProductGridSkeleton />
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">
                  <Icon name="search" size={26} />
                </span>
                <h3>Nenhum produto encontrado</h3>
                <p>Tente outro termo de busca ou remova os filtros aplicados.</p>
                <button type="button" className="btn btn-primary" onClick={clearFilters}>
                  Limpar filtros
                </button>
              </div>
            ) : (
              <ProductGrid
                products={filteredProducts}
                categoryMap={categoryMap}
                onOpen={setSelectedProduct}
                onAdd={handleAdd}
              />
            )}
          </>
        )}
      </section>

      {selectedProduct ? (
        <ProductModal
          key={selectedProduct.id}
          product={selectedProduct}
          categoryName={categoryMap.get(selectedProduct.categoryId)?.name ?? 'Sem categoria'}
          onClose={() => setSelectedProduct(null)}
          onAdd={handleAddFromModal}
        />
      ) : null}

      <p className="visually-hidden">Checkout simulado para o número {WHATSAPP_NUMBER}.</p>
    </main>
  )
}
