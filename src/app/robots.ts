import type { MetadataRoute } from 'next'

const SITE_URL = 'https://quadroantelucano.com.br'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     '/',
        // A rota /api/feed é só para o cliente próprio — não há valor SEO
        // em deixar bots indexarem JSON bruto de feeds de terceiros.
        disallow:  '/api/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host:    SITE_URL,
  }
}
