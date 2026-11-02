import { describe, expect, it } from 'vitest'
import { buildWhatsAppMessage, buildWhatsAppUrl } from '../../src/lib/whatsapp.js'

const lineItems = [
  { product: { name: 'Fone Bluetooth' }, qty: 2, subtotalCents: 59980 },
  { product: { name: 'Caneca Termica' }, qty: 1, subtotalCents: 5990 },
]

describe('whatsapp helpers', () => {
  it('monta a mensagem com itens e total', () => {
    const message = buildWhatsAppMessage({ lineItems, totalCents: 65970, appName: 'Catalogo Demo' })
    expect(message).toContain('2x Fone Bluetooth')
    expect(message).toContain('1x Caneca Termica')
    expect(message).toContain('Total:')
    expect(message).toContain('659,70')
  })

  it('gera URL com numero sanitizado e texto codificado', () => {
    const message = 'Pedido com 2 itens'
    const url = buildWhatsAppUrl({ phone: '+55 (11) 99999-9999', message })
    expect(url).toContain('https://wa.me/5511999999999?text=')
    expect(url).toContain(encodeURIComponent(message))
  })

  it('retorna null para telefone invalido', () => {
    expect(buildWhatsAppUrl({ phone: '123', message: 'oi' })).toBeNull()
    expect(buildWhatsAppUrl({ phone: '', message: 'oi' })).toBeNull()
  })
})
