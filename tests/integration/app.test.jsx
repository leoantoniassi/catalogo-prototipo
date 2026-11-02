import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../../src/App.jsx'
import { STORAGE_KEYS } from '../../src/config.js'

describe('fluxo da vitrine', () => {
  it('carrega, filtra, adiciona ao carrinho e finaliza no WhatsApp', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(await screen.findByText('Fone Bluetooth Pro')).toBeInTheDocument()

    const search = screen.getByRole('searchbox', { name: /Buscar produtos/i })
    await user.type(search, 'caneca')

    await waitFor(() => {
      expect(screen.getByText('Caneca Térmica')).toBeInTheDocument()
      expect(screen.queryByText('Fone Bluetooth Pro')).not.toBeInTheDocument()
    })

    await user.clear(search)
    const addButton = await screen.findByRole('button', {
      name: /Adicionar Fone Bluetooth Pro ao carrinho/i,
    })
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.getByText(/Fone Bluetooth Pro adicionado ao carrinho/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Abrir carrinho com 1 item/i }))

    const dialog = await screen.findByRole('dialog', { name: /Seu carrinho/i })
    expect(within(dialog).getByText('Fone Bluetooth Pro')).toBeInTheDocument()

    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    await user.click(within(dialog).getByRole('button', { name: /Finalizar no WhatsApp/i }))

    expect(openSpy).toHaveBeenCalledTimes(1)
    const [url, target] = openSpy.mock.calls[0]
    expect(url).toContain('https://wa.me/5511999999999?text=')
    expect(target).toBe('_blank')
  })

  it('alterna o tema e persiste a preferencia', async () => {
    const user = userEvent.setup()
    render(<App />)

    const toggle = await screen.findByRole('button', { name: /Ativar tema escuro/i })
    await user.click(toggle)

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('dark')
      expect(window.localStorage.getItem(STORAGE_KEYS.theme)).toBe('dark')
    })
  })
})

describe('fluxo administrativo', () => {
  it('faz login, cria e exclui um produto', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('link', { name: /Admin/i }))
    expect(
      await screen.findByRole('heading', { name: /Acesso administrativo/i }),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Senha/i), 'admin123')
    await user.click(screen.getByRole('button', { name: /Entrar no painel/i }))

    expect(
      await screen.findByRole('heading', { name: /Gestão do catálogo/i }, { timeout: 4000 }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Novo produto/i }))
    const formDialog = await screen.findByRole('dialog', { name: /Novo produto/i })

    await user.type(
      within(formDialog).getByLabelText(/Nome do produto/i),
      'Produto Integracao',
    )
    await user.type(within(formDialog).getByLabelText(/Preço/i), '123,45')
    await user.click(within(formDialog).getByRole('button', { name: /Criar produto/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Novo produto/i })).not.toBeInTheDocument()
    })
    expect(await screen.findByText('Produto Integracao')).toBeInTheDocument()

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.db))
    const created = stored.products.find((product) => product.name === 'Produto Integracao')
    expect(created).toBeTruthy()
    expect(created.priceCents).toBe(12345)

    const row = screen.getByText('Produto Integracao').closest('tr')
    await user.click(within(row).getByRole('button', { name: /Excluir/i }))

    const confirmDialog = await screen.findByRole('dialog', { name: /Excluir produto/i })
    await user.click(within(confirmDialog).getByRole('button', { name: /Excluir produto/i }))

    await waitFor(() => {
      expect(screen.queryByText('Produto Integracao')).not.toBeInTheDocument()
    })
  })
})
