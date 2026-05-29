import type { NextConfig } from 'next'

/* unoptimized: as imagens vêm de CDNs imprevisíveis de feeds (e mudam),
   e não as redimensionamos — então servimos a URL como veio, sem o
   otimizador do Next. Isso aceita qualquer host sem remotePatterns e
   evita o aviso de "loader sem width". A nitidez é garantida no parser
   (upgradeImageQuality eleva a resolução na origem). */
const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
}

export default nextConfig
