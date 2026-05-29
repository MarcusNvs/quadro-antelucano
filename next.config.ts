import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* Fixa a raiz do projeto. Há um package-lock.json órfão na pasta-pai e,
     sem isto, o Next inferia a raiz errada (aviso "multiple lockfiles") e
     poderia rastrear arquivos fora do projeto no build de produção. */
  outputFileTracingRoot: __dirname,

  /* unoptimized: as imagens vêm de CDNs imprevisíveis de feeds (e mudam),
     e não as redimensionamos — então servimos a URL como veio, sem o
     otimizador do Next. Isso aceita qualquer host sem remotePatterns e
     evita o aviso de "loader sem width". A nitidez é garantida no parser
     (upgradeImageQuality eleva a resolução na origem). */
  images: {
    unoptimized: true,
  },
}

export default nextConfig
