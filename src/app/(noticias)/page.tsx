import { Masthead }       from '@/features/noticias/components/Masthead'
import { FeedController } from '@/features/noticias/components/Feed'
import { Colophon }       from '@/features/noticias/components/Colophon'
import { SITE_URL, SITE_NAME } from '@/lib/site'

// ── JSON-LD — dados estruturados para motores de busca

const jsonLd = {
  '@context': 'https://schema.org',
  '@type':    'WebSite',
  name:       SITE_NAME,
  url:        SITE_URL,
  description:
    'Agregador editorial de notícias internacionais e brasileiras apresentado ' +
    'com a seriedade tipográfica de um jornal impresso.',
  author: {
    '@type': 'Person',
    name:    'Marcus Passos',
    email:   'marcuspneves@gmail.com',
  },
  publisher: {
    '@type': 'Organization',
    name:    SITE_NAME,
    url:     SITE_URL,
  },
  inLanguage: 'pt-BR',
  potentialAction: {
    '@type':       'ReadAction',
    target:        SITE_URL,
    name:          `Ler o ${SITE_NAME}`,
  },
}

export default function HomePage() {
  return (
    <>
      {/* Dados estruturados — não renderiza nada visível */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <FeedController
        masthead={<Masthead />}
        colophon={<Colophon />}
      />
    </>
  )
}
