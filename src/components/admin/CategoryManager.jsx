import { useState } from 'react'
import { useToast } from '../../context/ToastContext.jsx'
import { Icon } from '../ui/Icon.jsx'

export function CategoryManager({ categories, products, onCreate, onUpdate, onDelete }) {
  const { pushToast } = useToast()
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const countByCategory = products.reduce((accumulator, product) => {
    accumulator.set(product.categoryId, (accumulator.get(product.categoryId) ?? 0) + 1)
    return accumulator
  }, new Map())

  const resetForm = () => {
    setName('')
    setEditingId(null)
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (editingId) {
        await onUpdate(editingId, name)
        pushToast('Categoria atualizada.', 'success')
      } else {
        await onCreate(name)
        pushToast('Categoria criada.', 'success')
      }
      resetForm()
    } catch (submitError) {
      setError(submitError?.fieldErrors?.category ?? submitError?.message ?? 'Erro ao salvar categoria.')
    } finally {
      setBusy(false)
    }
  }

  const handleEdit = (category) => {
    setEditingId(category.id)
    setName(category.name)
    setError('')
  }

  const handleDelete = async (category) => {
    setError('')
    setBusyId(category.id)
    try {
      await onDelete(category.id)
      pushToast('Categoria excluída.', 'success')
      if (editingId === category.id) {
        resetForm()
      }
    } catch (deleteError) {
      setError(deleteError?.message ?? 'Erro ao excluir categoria.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Categorias ({categories.length})</h2>
      </div>

      <form className="category-form" onSubmit={handleSubmit}>
        <input
          className="input"
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setError('')
          }}
          placeholder={editingId ? 'Editar nome da categoria' : 'Nova categoria'}
          maxLength={60}
          aria-label="Nome da categoria"
          required
        />
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? <span className="spinner" /> : <Icon name={editingId ? 'check' : 'plus'} size={16} />}
          {editingId ? 'Salvar' : 'Adicionar'}
        </button>
        {editingId ? (
          <button type="button" className="btn btn-outline" onClick={resetForm} disabled={busy}>
            Cancelar
          </button>
        ) : null}
      </form>

      {error ? (
        <p className="field-error" role="alert" style={{ marginBottom: 12 }}>
          {error}
        </p>
      ) : null}

      <div className="category-list">
        {categories.map((category) => {
          const productCount = countByCategory.get(category.id) ?? 0
          const inUse = productCount > 0
          return (
            <div key={category.id} className="category-row">
              <span>
                <strong>{category.name}</strong>
                <small>
                  {productCount === 0
                    ? 'Nenhum produto'
                    : `${productCount} produto${productCount > 1 ? 's' : ''}`}
                </small>
              </span>
              <div className="row-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleEdit(category)}
                  disabled={busy || busyId === category.id}
                >
                  <Icon name="edit" size={14} />
                  Editar
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDelete(category)}
                  disabled={inUse || busy || busyId === category.id}
                  title={inUse ? 'Mova ou exclua os produtos desta categoria primeiro.' : 'Excluir categoria'}
                  style={{ color: inUse ? undefined : 'var(--danger)' }}
                >
                  {busyId === category.id ? (
                    <span className="spinner" />
                  ) : (
                    <Icon name="trash" size={14} />
                  )}
                  Excluir
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
