import { formatBRL } from './format.js'

export function buildWhatsAppMessage({ lineItems, totalCents, appName }) {
  const lines = lineItems.map(
    (item) =>
      `• ${item.qty}x ${item.product.name} - ${formatBRL(item.subtotalCents)}`,
  )
  return [
    `Ola! Gostaria de fazer um pedido no ${appName}:`,
    '',
    ...lines,
    '',
    `Total: ${formatBRL(totalCents)}`,
    '',
    'Pedido gerado pelo catalogo demo.',
  ].join('\n')
}

export function buildWhatsAppUrl({ phone, message }) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 15) {
    return null
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
