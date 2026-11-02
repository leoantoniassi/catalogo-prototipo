import { useState } from 'react'
import { ADMIN_CREDENTIALS } from '../../config.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { Icon } from '../ui/Icon.jsx'

export function LoginForm() {
  const { login } = useAuth()
  const { pushToast } = useToast()
  const [email, setEmail] = useState(ADMIN_CREDENTIALS.email)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    const result = await login(email, password)
    if (!result.ok) {
      setError(result.error)
    } else {
      setPassword('')
      pushToast('Bem-vindo ao painel administrativo.', 'success')
    }
    setBusy(false)
  }

  return (
    <main id="conteudo" className="container">
      <div className="login-wrap">
        <div className="login-card animate-fade-up">
          <span
            className="brand-mark"
            style={{ marginBottom: 16, width: 46, height: 46, borderRadius: 14 }}
          >
            <Icon name="lock" size={24} />
          </span>
          <h1>Acesso administrativo</h1>
          <p>Entre para gerenciar produtos e categorias da vitrine.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="field">
              <label className="label" htmlFor="login-email">
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                className="input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                autoFocus
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="login-password">
                Senha
              </label>
              <input
                id="login-password"
                type="password"
                className="input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error ? (
              <p className="field-error" role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? <span className="spinner" /> : <Icon name="logout" size={17} />}
              {busy ? 'Entrando...' : 'Entrar no painel'}
            </button>
          </form>

          <p className="login-hint">
            Credenciais de demonstração: <code>{ADMIN_CREDENTIALS.email}</code> /{' '}
            <code>{ADMIN_CREDENTIALS.password}</code>
            <br />
            Autenticação fictícia, apenas para demonstração.
          </p>
        </div>
      </div>
    </main>
  )
}
