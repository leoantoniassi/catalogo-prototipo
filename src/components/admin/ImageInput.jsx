import { useRef, useState } from 'react'
import { compressImage, isDataImageUrl } from '../../lib/image.js'
import { useToast } from '../../context/ToastContext.jsx'
import { Icon } from '../ui/Icon.jsx'
import { ProductImage } from '../ui/ProductImage.jsx'

export function ImageInput({ value, onChange, productName }) {
  const { pushToast } = useToast()
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }
    setError('')
    setUploading(true)
    try {
      const result = await compressImage(file)
      onChange(result.dataUrl)
      pushToast('Imagem comprimida e pronta para salvar.', 'success')
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="field span-2">
      <span className="label">Imagem do produto</span>
      <div className="image-input">
        <div className="image-preview">
          {value ? (
            <ProductImage src={value} alt={productName || 'Pré-visualização'} loading="eager" />
          ) : (
            <span>
              <Icon name="image" size={28} />
            </span>
          )}
        </div>

        <div>
          <div className="field">
            <label className="label" htmlFor="product-image-url">
              URL da imagem
            </label>
            <input
              id="product-image-url"
              type="url"
              className="input"
              value={isDataImageUrl(value) ? '' : value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              maxLength={2000}
            />
          </div>

          <div className="upload-actions" style={{ marginTop: 10 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <span className="spinner" /> : <Icon name="upload" size={15} />}
              {uploading ? 'Comprimindo...' : 'Enviar imagem'}
            </button>
            {value ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onChange('')}
              >
                <Icon name="trash" size={15} />
                Remover
              </button>
            ) : null}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFile}
              tabIndex={-1}
            />
          </div>

          <p className="help-text">
            JPG, PNG, WebP ou GIF de até 5 MB. A imagem é comprimida automaticamente para caber no
            navegador.
          </p>
          {isDataImageUrl(value) ? (
            <p className="help-text">Imagem carregada do dispositivo está em uso.</p>
          ) : null}
          {error ? (
            <p className="field-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
