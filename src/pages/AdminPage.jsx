import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useCatalog } from '../context/CatalogContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { LoginForm } from '../components/admin/LoginForm.jsx'
import { ProductForm } from '../components/admin/ProductForm.jsx'
import { ProductTable } from '../components/admin/ProductTable.jsx'
import { CategoryManager } from '../components/admin/CategoryManager.jsx'
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx'
import { Icon } from '../components/ui/Icon.jsx'

function AdminDashboard({ onNavigate }) {
  const { user, logout } = useAuth()
  const { pushToast } = useToast()
  const {
    products,
    categories,
    loading,
    addProduct,
    editProduct,
    removeProduct,
    addCategory,
    editCategory,
    removeCategory,
    restoreDemo,
  } = useCatalog()

  const [tab, setTab] = useState('products')
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [confirmBusy, setConfirmBusy] = useState(false)

  const openCreate = () => {
    setEditingProduct(null)
    setFormOpen(true)
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingProduct(null)
  }

  const handleProductSave = async (values) => {
    if (editingProduct) {
      await editProduct(editingProduct.id, values)
      pushToast('Produto atualizado com sucesso.', 'success')
    } else {
      await addProduct(values)
      pushToast('Produto criado com sucesso.', 'success')
    }
    closeForm()
  }

  const handleConfirm = async () => {
    if (!confirm) {
      return
    }
    setConfirmBusy(true)
    try {
      if (confirm.type === 'reset') {
        await restoreDemo()
        closeForm()
        pushToast('Dados de demonstração restaurados.', 'success')
      } else {
        await removeProduct(confirm.product.id)
        pushToast('Produto excluído.', 'success')
      }
      setConfirm(null)
    } catch (error) {
      pushToast(error?.message ?? 'Não foi possível concluir a ação.', 'error')
    } finally {
      setConfirmBusy(false)
    }
  }

  const handleLogout = () => {
    logout()
    pushToast('Sessão encerrada.', 'info')
  }

  const confirmTitle =
    confirm?.type === 'reset' ? 'Restaurar dados de demonstração?' : 'Excluir produto?'
  const confirmDescription =
    confirm?.type === 'reset'
      ? 'Todos os produtos e categorias voltarão ao estado inicial. As alterações locais serão perdidas.'
      : `O produto "${confirm?.product?.name ?? ''}" será removido do catálogo. Essa ação não pode ser desfeita.`

  return (
    <main id="conteudo" className="container admin-shell">
      <div className="admin-header">
        <div>
          <h1>Gestão do catálogo</h1>
          <p>
            Logado como <strong>{user?.email}</strong> - autenticação fictícia para demonstração.
          </p>
        </div>
        <div className="admin-actions">
          <button type="button" className="btn btn-outline" onClick={() => onNavigate('catalog')}>
            <Icon name="store" size={16} />
            Ver vitrine
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setConfirm({ type: 'reset' })}
          >
            <Icon name="refresh" size={16} />
            Restaurar demo
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            <Icon name="logout" size={16} />
            Sair
          </button>
        </div>
      </div>

      <div className="admin-tabs" role="tablist" aria-label="Seções do painel">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'products'}
          className={`tab-button ${tab === 'products' ? 'is-active' : ''}`}
          onClick={() => setTab('products')}
        >
          Produtos ({products.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'categories'}
          className={`tab-button ${tab === 'categories' ? 'is-active' : ''}`}
          onClick={() => setTab('categories')}
        >
          Categorias ({categories.length})
        </button>
      </div>

      {loading ? (
        <div className="panel">
          <div className="empty-state">
            <span className="spinner" style={{ width: 28, height: 28 }} />
            <p>Carregando painel...</p>
          </div>
        </div>
      ) : tab === 'products' ? (
        <div className="panel" role="tabpanel" aria-label="Produtos">
          <div className="panel-header">
            <h2>Produtos cadastrados</h2>
            <button
              type="button"
              className="btn btn-primary"
              onClick={openCreate}
              disabled={categories.length === 0}
              title={categories.length === 0 ? 'Crie uma categoria primeiro.' : 'Novo produto'}
            >
              <Icon name="plus" size={16} />
              Novo produto
            </button>
          </div>

          {products.length === 0 ? (
            <div className="empty-state" style={{ border: 0 }}>
              <span className="empty-icon">
                <Icon name="package" size={26} />
              </span>
              <h3>Nenhum produto cadastrado</h3>
              <p>Adicione o primeiro produto para exibi-lo na vitrine.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={openCreate}
                disabled={categories.length === 0}
              >
                <Icon name="plus" size={16} />
                Criar produto
              </button>
            </div>
          ) : (
            <ProductTable
              products={products}
              categories={categories}
              onEdit={openEdit}
              onDelete={(product) => setConfirm({ type: 'product', product })}
            />
          )}
        </div>
      ) : (
        <div role="tabpanel" aria-label="Categorias">
          <CategoryManager
            categories={categories}
            products={products}
            onCreate={addCategory}
            onUpdate={editCategory}
            onDelete={removeCategory}
          />
        </div>
      )}

      {formOpen ? (
        <ProductForm
          key={editingProduct?.id ?? 'new'}
          open
          product={editingProduct}
          categories={categories}
          onSave={handleProductSave}
          onClose={closeForm}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={confirm?.type === 'reset' ? 'Restaurar' : 'Excluir produto'}
        danger={confirm?.type === 'product'}
        busy={confirmBusy}
        onConfirm={handleConfirm}
        onClose={() => setConfirm(null)}
      />
    </main>
  )
}

export default function AdminPage({ onNavigate }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return <AdminDashboard onNavigate={onNavigate} />
}
