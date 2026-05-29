import { Masthead }       from '@/features/noticias/components/Masthead'
import { FeedController } from '@/features/noticias/components/Feed'
import { Colophon }       from '@/features/noticias/components/Colophon'

// ── JSON-LD — dados estruturados para motores de busca

const jsonLd = {
  '@context': 'https://schema.org',
  '@type':    'WebSite',
  name:       'Quadro Antelucano',
  url:        'https://quadroantelucano.com.br',
  description:
    'Agregador editorial de notícias internacionais e brasileiras apresentado ' +
    'com a seriedade tipográfica de um jornal impresso.',
  author: {
    '@type': 'Person',
    name:    'Marcus Neves',
    email:   'marcuspneves@gmail.com',
  },
  publisher: {
    '@type': 'Organization',
    name:    'Quadro Antelucano',
    url:     'https://quadroantelucano.com.br',
  },
  inLanguage: 'pt-BR',
  potentialAction: {
    '@type':       'ReadAction',
    target:        'https://quadroantelucano.com.br',
    name:          'Ler o Quadro Antelucano',
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
