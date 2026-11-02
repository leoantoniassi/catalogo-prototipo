import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon.jsx'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock.js'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'

export function Modal({ open, onClose, title, children, footer, wide = false }) {
  const panelRef = useRef(null)
  const titleId = useId()

  useBodyScrollLock(open)
  useFocusTrap(panelRef, open)

  useEffect(() => {
    if (!open) {
      return undefined
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) {
    return null
  }

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.()
        }
      }}
    >
      <div
        className={`modal ${wide ? 'modal-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panelRef}
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}
