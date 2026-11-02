import { APP_NAME, APP_TAGLINE } from '../../config.js'
import { useCart } from '../../context/CartContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { Icon } from '../ui/Icon.jsx'

export function Header({ route, onNavigate, onOpenCart }) {
  const { count } = useCart()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a
          className="brand"
          href="#/"
          onClick={(event) => {
            event.preventDefault()
            onNavigate('catalog')
          }}
          aria-label={`${APP_NAME} - ir para a vitrine`}
        >
          <span className="brand-mark">
            <Icon name="store" size={22} />
          </span>
          <span>
            <span className="brand-text">{APP_NAME}</span>
            <span className="brand-sub">{APP_TAGLINE}</span>
          </span>
        </a>

        <nav className="header-nav" aria-label="Ações do catálogo">
          <a
            className={`header-link ${route === 'admin' ? 'is-active' : ''}`}
            href="#/admin"
            onClick={(event) => {
              event.preventDefault()
              onNavigate('admin')
            }}
          >
            <Icon name="user" size={18} />
            <span>Admin</span>
          </a>

          <button
            type="button"
            className="icon-button"
            onClick={toggleTheme}
            aria-label={`Ativar tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
            title={`Tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} />
          </button>

          <button
            type="button"
            className="icon-button"
            onClick={onOpenCart}
            aria-label={`Abrir carrinho com ${count} item(ns)`}
            title="Carrinho"
          >
            <Icon name="cart" size={19} />
            {count > 0 ? <span className="cart-count">{count}</span> : null}
          </button>
        </nav>
      </div>
    </header>
  )
}
