/* Configuração central do site — fonte única da URL canônica.

   Em produção, defina NEXT_PUBLIC_SITE_URL nas variáveis de ambiente
   (ex.: ao migrar para um domínio próprio, basta setar lá na Vercel);
   sem isso, usa a URL atual da Vercel. Tudo que precisa da URL canônica
   (metadata, OpenGraph, JSON-LD, sitemap, robots) importa daqui. */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ||
  'https://quadro-antelucano.vercel.app'

export const SITE_NAME = 'Quadro Antelucano'
export const TAGLINE   = 'O jornal antes do amanhecer.'
