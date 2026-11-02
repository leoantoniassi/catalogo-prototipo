import { lazy, Suspense, useState } from 'react'
import { CartProvider } from './context/CartContext.jsx'
import { CatalogProvider } from './context/CatalogContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { useHashRoute } from './hooks/useHashRoute.js'
import { Header } from './components/layout/Header.jsx'
import { Footer } from './components/layout/Footer.jsx'
import { CartDrawer } from './components/cart/CartDrawer.jsx'
import { ToastStack } from './components/ui/ToastStack.jsx'
import { Icon } from './components/ui/Icon.jsx'
import { CatalogPage } from './pages/CatalogPage.jsx'

const AdminPage = lazy(() => import('./pages/AdminPage.jsx'))

function AdminFallback() {
  return (
    <main id="conteudo" className="container admin-shell">
      <div className="panel">
        <div className="empty-state" style={{ border: 0 }}>
          <span className="spinner" style={{ width: 28, height: 28 }} />
          <p>Carregando painel administrativo...</p>
        </div>
      </div>
    </main>
  )
}

function AppShell() {
  const { route, navigate } = useHashRoute()
  const [cartOpen, setCartOpen] = useState(false)

  const handleNavigate = (nextRoute) => {
    setCartOpen(false)
    navigate(nextRoute)
  }

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteudo
      </a>

      <Header route={route} onNavigate={handleNavigate} onOpenCart={() => setCartOpen(true)} />

      {route === 'admin' ? (
        <Suspense fallback={<AdminFallback />}>
          <AdminPage onNavigate={handleNavigate} />
        </Suspense>
      ) : (
        <CatalogPage />
      )}

      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CatalogProvider>
            <CartProvider>
              <AppShell />
              <ToastStack />
            </CartProvider>
          </CatalogProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
