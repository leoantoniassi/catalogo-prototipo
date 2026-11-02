import { APP_NAME } from '../../config.js'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span>
          <strong>{APP_NAME}</strong> - dados salvos no seu navegador
        </span>
        <span>Protótipo demonstrativo com React + Vite</span>
      </div>
    </footer>
  )
}
