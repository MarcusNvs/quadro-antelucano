import type { MetadataRoute } from 'next'

const SITE_URL = 'https://quadroantelucano.com.br'

export default function sitemap(): MetadataRoute.Sitemap {
  // O site é uma SPA com seções via tabs cliente — apenas a home é indexável.
  // Mantemos o sitemap para sinalizar lastModified ao Google a cada deploy.
  return [
    {
      url:            SITE_URL,
      lastModified:   new Date(),
      changeFrequency: 'hourly',
      priority:        1,
    },
  ]
}
