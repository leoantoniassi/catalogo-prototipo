import { useId, useState } from 'react'
import { formatBRL, parsePriceToCents } from '../../lib/format.js'
import { Modal } from '../ui/Modal.jsx'
import { ImageInput } from './ImageInput.jsx'

function createEmptyForm(categories) {
  return {
    name: '',
    description: '',
    price: '',
    stock: '0',
    categoryId: categories[0]?.id ?? '',
    image: '',
    featured: false,
  }
}

function productToForm(product) {
  return {
    name: product.name,
    description: product.description,
    price: formatBRL(product.priceCents).replace('R$', '').trim(),
    stock: String(product.stock),
    categoryId: product.categoryId,
    image: product.image,
    featured: Boolean(product.featured),
  }
}

export function ProductForm({ open, product, categories, onSave, onClose }) {
  const [form, setForm] = useState(() =>
    product ? productToForm(product) : createEmptyForm(categories),
  )
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const formId = useId()

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field] && !current.form) {
        return current
      }
      const next = { ...current }
      delete next[field]
      delete next.form
      return next
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setErrors({})

    const payload = {
      name: form.name,
      description: form.description,
      priceCents: parsePriceToCents(form.price),
      stock: form.stock.trim() === '' ? '' : Number(form.stock),
      categoryId: form.categoryId,
      image: form.image,
      featured: form.featured,
    }

    try {
      await onSave(payload)
    } catch (error) {
      if (error?.fieldErrors) {
        setErrors(error.fieldErrors)
      } else {
        setErrors({ form: error?.message ?? 'Não foi possível salvar o produto.' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title={product ? 'Editar produto' : 'Novo produto'}
      wide
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" form={formId} className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner" /> : null}
            {product ? 'Salvar alterações' : 'Criar produto'}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="form-grid" noValidate>
        {errors.form ? (
          <p className="field-error span-2" role="alert">
            {errors.form}
          </p>
        ) : null}

        <div className="field span-2">
          <label className="label" htmlFor="product-name">
            Nome do produto
          </label>
          <input
            id="product-name"
            className="input"
            value={form.name}
            onChange={(event) => setField('name', event.target.value)}
            placeholder="Ex.: Fone Bluetooth Pro"
            maxLength={120}
            aria-invalid={Boolean(errors.name)}
            required
          />
          {errors.name ? <span className="field-error">{errors.name}</span> : null}
        </div>

        <div className="field span-2">
          <label className="label" htmlFor="product-description">
            Descrição
          </label>
          <textarea
            id="product-description"
            className="textarea"
            value={form.description}
            onChange={(event) => setField('description', event.target.value)}
            placeholder="Descreva os principais detalhes do produto."
            maxLength={1000}
            aria-invalid={Boolean(errors.description)}
          />
          {errors.description ? (
            <span className="field-error">{errors.description}</span>
          ) : null}
        </div>

        <div className="field">
          <label className="label" htmlFor="product-price">
            Preço (R$)
          </label>
          <input
            id="product-price"
            className="input"
            inputMode="decimal"
            value={form.price}
            onChange={(event) => setField('price', event.target.value)}
            placeholder="0,00"
            aria-invalid={Boolean(errors.priceCents)}
            required
          />
          {errors.priceCents ? <span className="field-error">{errors.priceCents}</span> : null}
        </div>

        <div className="field">
          <label className="label" htmlFor="product-stock">
            Estoque
          </label>
          <input
            id="product-stock"
            type="number"
            className="input"
            min="0"
            step="1"
            value={form.stock}
            onChange={(event) => setField('stock', event.target.value)}
            aria-invalid={Boolean(errors.stock)}
          />
          {errors.stock ? <span className="field-error">{errors.stock}</span> : null}
        </div>

        <div className="field">
          <label className="label" htmlFor="product-category">
            Categoria
          </label>
          <select
            id="product-category"
            className="select"
            value={form.categoryId}
            onChange={(event) => setField('categoryId', event.target.value)}
            aria-invalid={Boolean(errors.categoryId)}
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? (
            <span className="field-error">{errors.categoryId}</span>
          ) : null}
        </div>

        <div className="field">
          <span className="label">Destaque</span>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => setField('featured', event.target.checked)}
            />
            Exibir como produto em destaque
          </label>
        </div>

        <ImageInput
          value={form.image}
          onChange={(value) => setField('image', value)}
          productName={form.name}
        />
        {errors.image ? (
          <span className="field-error span-2">{errors.image}</span>
        ) : null}
      </form>
    </Modal>
  )
}
