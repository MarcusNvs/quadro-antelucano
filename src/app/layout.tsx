import type { Metadata, Viewport } from 'next'
import { Libre_Baskerville } from 'next/font/google'
import './globals.css'


// ── Fonte auto-hospedada via next/font (sem FOUC, sem requisição externa) ──

const libreBaskerville = Libre_Baskerville({
  weight:   ['400', '700'],
  style:    ['normal', 'italic'],
  subsets:  ['latin', 'latin-ext'],
  display:  'swap',
  variable: '--font-baskerville',
})

// ── Metadados SEO

const SITE_URL  = 'https://quadroantelucano.com.br'
const SITE_NAME = 'Quadro Antelucano'
const TAGLINE   = 'O jornal antes do amanhecer.'
const DESCRIPTION =
  'Quadro Antelucano é um agregador editorial de notícias do Brasil e do mundo — ' +
  'CNN Brasil, G1, Folha, BBC, Le Monde, NASA, The Verge e mais — ' +
  'apresentado com a seriedade tipográfica de um jornal impresso.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default:  `${SITE_NAME} — ${TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },

  description: DESCRIPTION,

  authors: [{ name: 'Marcus Neves', url: SITE_URL }],
  creator: 'Marcus Neves',
  publisher: SITE_NAME,

  // ── Open Graph
  //   A imagem é gerada dinamicamente por src/app/opengraph-image.tsx
  //   (Next injeta og:image e twitter:image automaticamente).
  openGraph: {
    type:        'website',
    url:         SITE_URL,
    siteName:    SITE_NAME,
    title:       `${SITE_NAME} — ${TAGLINE}`,
    description: DESCRIPTION,
    locale:      'pt_BR',
  },

  // ── Twitter / X Card
  twitter: {
    card:        'summary_large_image',
    title:       `${SITE_NAME} — ${TAGLINE}`,
    description: DESCRIPTION,
    creator:     '@marcuspneves',
  },

  // ── Robots
  robots: {
    index:          true,
    follow:         true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },

  // ── Canonical
  alternates: {
    canonical: SITE_URL,
  },

  // ── Verificação de ferramentas de busca (substitua pelos seus tokens)
  // verification: {
  //   google: 'SEU_GOOGLE_SITE_VERIFICATION',
  //   yandex: 'SEU_YANDEX_VERIFICATION',
  // },
}

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  themeColor:   '#b4996e',
}

// ── Layout raiz

/* Hosts de imagem mais usados pelas seções — preconnect acelera o LCP
   resolvendo DNS, TCP e TLS antes da imagem ser requisitada. Sem crossOrigin:
   as <img> carregam sem CORS, então a conexão pré-aberta precisa casar. */
const IMAGE_HOSTS = [
  // Mundo
  'https://ichef.bbci.co.uk',
  'https://img.lemde.fr',
  'https://i.redd.it',
  'https://preview.redd.it',
  'https://media.wired.com',
  'https://cdn.vox-cdn.com',
  'https://platform.theverge.com',
  'https://i.kinja-img.com',
  'https://media.dev.to',
  'https://media2.dev.to',
  // Brasil
  'https://s2-g1.glbimg.com',
  'https://s2-valor.glbimg.com',
  'https://s2-cnnbrasil.glbimg.com',
  'https://s2-extra.glbimg.com',
  'https://f.i.uol.com.br',
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={libreBaskerville.variable}>
      <head>
        {IMAGE_HOSTS.map(href => (
          <link key={href} rel="preconnect" href={href} />
        ))}
      </head>
      <body className={libreBaskerville.className}>{children}</body>
    </html>
  )
}
