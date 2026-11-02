import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  fetchCatalog,
  resetCatalog,
  updateCategory,
  updateProduct,
} from '../lib/api.js'

const CatalogContext = createContext(null)

const initialState = {
  products: [],
  categories: [],
  loading: true,
  error: null,
}

export function CatalogProvider({ children }) {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    let active = true
    fetchCatalog()
      .then((catalog) => {
        if (active) {
          setState({ ...catalog, loading: false, error: null })
        }
      })
      .catch((error) => {
        if (active) {
          setState({
            products: [],
            categories: [],
            loading: false,
            error: error?.message ?? 'Não foi possível carregar o catálogo.',
          })
        }
      })
    return () => {
      active = false
    }
  }, [])

  const addProduct = useCallback(async (input) => {
    const product = await createProduct(input)
    setState((current) => ({ ...current, products: [product, ...current.products] }))
    return product
  }, [])

  const editProduct = useCallback(async (id, input) => {
    const product = await updateProduct(id, input)
    setState((current) => ({
      ...current,
      products: current.products.map((item) => (item.id === id ? product : item)),
    }))
    return product
  }, [])

  const removeProduct = useCallback(async (id) => {
    await deleteProduct(id)
    setState((current) => ({
      ...current,
      products: current.products.filter((item) => item.id !== id),
    }))
  }, [])

  const addCategory = useCallback(async (name) => {
    const category = await createCategory(name)
    setState((current) => ({ ...current, categories: [...current.categories, category] }))
    return category
  }, [])

  const editCategory = useCallback(async (id, name) => {
    const category = await updateCategory(id, name)
    setState((current) => ({
      ...current,
      categories: current.categories.map((item) => (item.id === id ? category : item)),
    }))
    return category
  }, [])

  const removeCategory = useCallback(async (id) => {
    await deleteCategory(id)
    setState((current) => ({
      ...current,
      categories: current.categories.filter((item) => item.id !== id),
    }))
  }, [])

  const restoreDemo = useCallback(async () => {
    const catalog = await resetCatalog()
    setState({ ...catalog, loading: false, error: null })
    return catalog
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      addProduct,
      editProduct,
      removeProduct,
      addCategory,
      editCategory,
      removeCategory,
      restoreDemo,
    }),
    [
      state,
      addProduct,
      editProduct,
      removeProduct,
      addCategory,
      editCategory,
      removeCategory,
      restoreDemo,
    ],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) {
    throw new Error('useCatalog deve ser usado dentro de CatalogProvider')
  }
  return context
}
