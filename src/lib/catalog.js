import { normalizeText } from './format.js'

export const SORT_OPTIONS = Object.freeze([
  { value: 'featured', label: 'Destaques' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'name', label: 'Nome A-Z' },
  { value: 'newest', label: 'Mais recentes' },
])

function compareByFeatured(a, b) {
  if (a.featured !== b.featured) {
    return a.featured ? -1 : 1
  }
  return a.name.localeCompare(b.name, 'pt-BR')
}

const comparators = {
  featured: compareByFeatured,
  'price-asc': (a, b) => a.priceCents - b.priceCents,
  'price-desc': (a, b) => b.priceCents - a.priceCents,
  name: (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
  newest: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
}

export function filterAndSortProducts(products, { query = '', categoryId = 'all', sort = 'featured' } = {}) {
  const normalizedQuery = normalizeText(query)
  const filtered = products.filter((product) => {
    const matchesCategory = categoryId === 'all' || product.categoryId === categoryId
    if (!matchesCategory) {
      return false
    }
    if (!normalizedQuery) {
      return true
    }
    const haystack = normalizeText(`${product.name} ${product.description}`)
    return haystack.includes(normalizedQuery)
  })

  const comparator = comparators[sort] ?? comparators.featured
  return filtered.sort(comparator)
}
