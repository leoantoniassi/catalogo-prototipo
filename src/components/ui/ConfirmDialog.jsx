import { Modal } from './Modal.jsx'

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  busy = false,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? <span className="spinner" /> : null}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="muted">{description}</p>
    </Modal>
  )
}
