# Catálogo Demo

Protótipo de catálogo online responsivo e interativo, feito com React + Vite. Inclui vitrine com busca e filtros, tema claro/escuro, carrinho persistente, checkout simulado via WhatsApp e painel administrativo com CRUD de produtos e categorias.

## Recursos

- Vitrine responsiva com busca, filtro por categoria, ordenação, skeleton e estado vazio.
- Modal de detalhes do produto e imagem com fallback.
- Carrinho lateral com controle de quantidade, persistência em `localStorage` e checkout via WhatsApp.
- Tema claro/escuro com persistência e respeito à preferência do sistema.
- Painel admin com login fictício, cadastro/edição/exclusão de produtos, gestão de categorias e restauração dos dados demo.
- Upload de imagem com validação e compressão no navegador (Canvas/WebP).
- Acessibilidade: foco preso em modais, navegação por teclado, `aria-*`, mensagens de status e suporte a `prefers-reduced-motion`.
- Testes unitários e de integração com Vitest + Testing Library.

## Stack

- React 19
- Vite 8
- Vitest 5 + Testing Library + jsdom
- ESLint 10

## Requisitos

- Node.js 20.19+, 22.13+ ou 24+
- npm

## Como rodar

```bash
npm install
npm run dev
```

Acesse a URL exibida pelo Vite.

> Se o `npm install` falhar com erro de `edgesOut` em versões recentes do npm, use `npm install --legacy-peer-deps`.

### Scripts

```bash
npm run dev            # servidor de desenvolvimento
npm run build          # build de produção em dist/
npm run preview        # pré-visualização do build
npm run lint           # análise estática
npm test               # testes (execução única)
npm run test:watch     # testes em modo watch
npm run test:coverage  # testes com cobertura
```

## Acesso administrativo

- URL: `/#/admin`
- E-mail: `admin@demo.com`
- Senha: `admin123`

A autenticação é fictícia e existe apenas para demonstrar o fluxo. Não use este modelo em produção sem um backend real de autenticação e autorização.

## Dados e persistência

Tudo é simulado no navegador, sem backend:

- `catalog:v1:db`: produtos e categorias
- `catalog:v1:cart`: carrinho
- `catalog:v1:theme`: preferência de tema
- `catalog:v1:auth`: sessão administrativa em `sessionStorage`

Os preços são armazenados em centavos (`priceCents`) e formatados em BRL. Os dados demo podem ser restaurados pelo painel administrativo. O limite típico do `localStorage` é de cerca de 5 MB por origem; imagens enviadas são comprimidas, mas o espaço pode se esgotar.

## Configuração

Ajuste em `src/config.js`:

- `WHATSAPP_NUMBER`: número de destino do checkout simulado (padrão `5511999999999`, apenas exemplo).
- `ADMIN_CREDENTIALS`: credenciais demo.
- Limites de nome, descrição, categoria e imagem.

## Deploy no GitHub Pages

O workflow em `.github/workflows/deploy.yml` publica o build a cada push na branch `main`.

1. No GitHub, abra **Settings > Pages** e selecione **GitHub Actions** como fonte.
2. Faça push na branch `main`.
3. O workflow executa lint, testes e build e publica o site.

O `base` em `vite.config.js` está definido como `/catalogo-prototipo/`, correspondente ao nome do repositório. Se o repositório tiver outro nome, atualize esse valor.

Site esperado: `https://<usuario>.github.io/catalogo-prototipo/`

## Estrutura

```text
src/
  components/   # UI, catálogo, carrinho e admin
  context/      # Auth, Cart, Catalog, Theme e Toast
  data/         # dados demo
  hooks/        # rota por hash, foco, scroll, debounce etc.
  lib/          # API simulada, storage, carrinho, imagem, WhatsApp
  pages/        # vitrine e painel administrativo
  styles/       # tokens, base, componentes e animações
tests/
  unit/         # funções puras e serviços
  integration/  # fluxos da vitrine e do admin
```

## Limitações

- Protótipo client-side: não há servidor, banco de dados nem autenticação real.
- Dados e imagens ficam no navegador e não são sincronizados entre dispositivos.
- Upload limitado pelo `localStorage`; não indicado para catálogos grandes.
- Checkout apenas monta uma mensagem e abre o WhatsApp; não processa pagamentos.
- A meta de 65 KB gzip para o JS inicial não foi atingida (~83 KB gzip); o painel admin é carregado sob demanda em um chunk separado.
- O ambiente de desenvolvimento pode exibir avisos de engine do Node e dependências de desenvolvimento com vulnerabilidades moderadas; o bundle de produção não inclui essas dependências.

## Licença

Projeto demonstrativo, sem licença definida.
