import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

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
