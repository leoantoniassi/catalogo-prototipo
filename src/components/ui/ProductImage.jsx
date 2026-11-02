import { useState } from 'react'
import { createPlaceholderImage, resolveImageSource } from '../../lib/image.js'

export function ProductImage({ src, alt, className = '', loading = 'lazy', ...rest }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const failed = Boolean(src) && failedSrc === src

  const finalSrc = failed || !src ? createPlaceholderImage(alt) : resolveImageSource(src, alt)

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
      {...rest}
    />
  )
}
