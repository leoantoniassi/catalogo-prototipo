import { Icon } from './Icon.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const TYPE_ICON = {
  success: 'check',
  error: 'alert',
  info: 'info',
}

export function ToastStack() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon">
            <Icon name={TYPE_ICON[toast.type] ?? 'info'} size={18} />
          </span>
          <span className="toast-message">{toast.message}</span>
          <button
            type="button"
            className="modal-close"
            onClick={() => dismissToast(toast.id)}
            aria-label="Fechar notificação"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
