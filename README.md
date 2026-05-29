# Quadro Antelucano

> O jornal antes do amanhecer.

Agregador editorial de notícias do **Brasil e do mundo**, apresentado com a
seriedade tipográfica de um jornal impresso. Lê feeds RSS/Atom de veículos
reais e os compõe em duas edições — internacional e brasileira — com identidade
visual própria (paleta empoeirada, Libre Baskerville, capitulares e réguas).

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript (strict) · CSS Modules
— sem nenhuma dependência de runtime além do core do framework.

---

## Demonstração

> _Adicione aqui um print ou GIF da home (`docs/preview.png`)._

Edição internacional: BBC World, Le Monde, NASA, Lifehacker, The Verge, Wired,
r/aww, r/pics, Dev.to.
Edição brasileira: CNN Brasil, G1, Folha, Extra, Valor, Investing, GE,
Canaltech, Adrenaline.

---

## Destaques técnicos

- **Parser RSS 2.0 + Atom 1.0 próprio** (`src/lib/feed-parser.ts`), sem
  bibliotecas — autodetecção de formato, CDATA, entidades HTML (incl. astrais
  via `String.fromCodePoint`), e extração inteligente de imagem.
- **Detecção de charset** — lê os bytes do feed e decodifica pelo encoding
  declarado (a Folha, por exemplo, serve `ISO-8859-1`), evitando acentos
  corrompidos.
- **Cache no servidor com TTL + _stale fallback_** — cada feed é buscado no
  máximo 1×/5 min; se a origem falha (ex.: rate-limit 429 da NASA), serve o
  último resultado bom em vez de quebrar.
- **Resiliência de imagem** — _upgrade_ de resolução por CDN (a BBC entrega
  thumbnail de 240px; reescrevemos para 1024px), filtro de placeholders e
  vídeos, e _placeholder_ elegante quando a imagem falha.
- **SEO completo** — metadata (OpenGraph, Twitter Card, canonical, robots),
  JSON-LD, `sitemap.ts`, `robots.ts` e **OG image gerada dinamicamente** via
  `ImageResponse` (`src/app/opengraph-image.tsx`).
- **Acessibilidade** — HTML semântico, `aria-*`, navegação por _tabs_ com
  `aria-selected`, `prefers-reduced-motion`, `alt` em todas as imagens.
- **UX cuidada** — troca de seção com cancelamento de requisição
  (`AbortController`), estados de carregamento/vazio/erro, carrossel de chips
  responsivo no mobile.

---

## Arquitetura

```
src/
├── app/
│   ├── api/feed/route.ts     # busca + parseia o feed (server-side), com cache próprio
│   ├── opengraph-image.tsx   # OG dinâmico (Satori)
│   ├── sitemap.ts            # sitemap dinâmico
│   ├── robots.ts             # robots dinâmico
│   ├── layout.tsx            # metadata SEO, next/font, preconnect
│   └── page.tsx              # JSON-LD + composição da home
├── components/               # Masthead, SectionNav, Feed, Article, ...
└── lib/
    ├── feed-parser.ts        # parser RSS/Atom (funções puras)
    ├── sections.ts           # as duas edições (mundo / br)
    ├── image-upgrade.ts      # reescrita de URL por CDN
    └── format.ts             # helpers (numerais romanos, etc.)
```

O fluxo é: o cliente (`Feed.tsx`) chama `GET /api/feed?source=<id>`; a rota
valida a seção, busca o feed na origem (sem CORS, pois é server-side),
decodifica, parseia e devolve JSON normalizado.

### Por que o conteúdo é buscado no cliente?

A home renderiza o _shell_ (cabeçalho, navegação, esqueleto) no servidor e
busca os artigos no cliente, ao trocar de seção. Foi uma escolha consciente:

- O conteúdo é de **terceiros** (BBC, G1…). Indexá-lo não é o objetivo — não faz
  sentido competir com as próprias fontes pelo mesmo texto no Google.
- O que importa para SEO aqui é a **página do agregador**, totalmente coberta
  por metadata, JSON-LD, sitemap e OG.
- A interação central é **trocar de veículo** rapidamente, sem recarregar —
  o que o _fetch_ no cliente + cache em memória entregam bem.

Se o objetivo fosse indexar o conteúdo, a seção inicial seria renderizada no
servidor (RSC) e as trocas ficariam client-side — evolução natural para uma v2.

---

## Como rodar

Requisitos: Node.js 18.18+ (recomendado 20+).

```bash
npm install
npm run dev      # http://localhost:3000
```

Produção:

```bash
npm run build
npm start
```

---

## Roadmap (ideias para v2)

- Renderizar a seção inicial no servidor (SSR) para indexação de conteúdo.
- Testes de integração da rota `/api/feed`.
- Busca/filtro entre seções e modo de leitura.
- PWA (manifest + service worker para leitura offline).

---

## Autor

**Marcus Neves** — projeto de portfólio.
Composto em Libre Baskerville · MMXXVI.
