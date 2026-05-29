import type { Region, Section } from './types'

/* Duas regiões: mundo (feeds internacionais) e Brasil.
   O formato (RSS vs. Atom) é autodetectado pelo parser. */

export const SECTIONS_WORLD: Section[] = [
  {
    id:     'mundo',
    label:  'BBC World',
    accent: '#8a1e10',
    url:    'https://feeds.bbci.co.uk/news/world/rss.xml',
    region: 'world',
  },
  {
    id:     'cultura',
    label:  'Le Monde',
    accent: '#b3892c',
    url:    'https://www.lemonde.fr/international/rss_full.xml',
    region: 'world',
  },
  {
    id:     'ciencia',
    label:  'NASA',
    accent: '#2c4e7a',
    url:    'https://www.nasa.gov/rss/dyn/lg_image_of_the_day.rss',
    region: 'world',
  },
  {
    id:     'tecnologia',
    label:  'Lifehacker',
    accent: '#275f54',
    url:    'https://lifehacker.com/rss',
    region: 'world',
  },
  {
    id:     'opiniao',
    label:  'The Verge',
    accent: '#6f3a78',
    url:    'https://www.theverge.com/rss/index.xml',
    region: 'world',
  },
  {
    id:     'economia',
    label:  'Wired',
    accent: '#4d3a93',
    url:    'https://www.wired.com/feed/rss',
    region: 'world',
  },
  {
    id:     'vida',
    label:  'r/aww',
    accent: '#b85d2a',
    url:    'https://www.reddit.com/r/aww/.rss',
    region: 'world',
  },
  {
    id:     'imagens',
    label:  'r/pics',
    accent: '#4f6b3a',
    url:    'https://www.reddit.com/r/pics/.rss',
    region: 'world',
  },
  {
    id:     'codigo',
    label:  'Dev.to',
    accent: '#9c4365',
    url:    'https://dev.to/feed',
    region: 'world',
  },
]

/* Brasil — ordem segue a paridade temática com a lista internacional:
   mundo → política → jornalismo → cotidiano → economia → mercado →
   esportes → tecnologia → games. */
export const SECTIONS_BR: Section[] = [
  {
    id:     'br-mundo',
    label:  'CNN Brasil',
    accent: '#8a1e10',
    url:    'https://www.cnnbrasil.com.br/feed/',
    region: 'br',
  },
  {
    id:     'br-politica',
    label:  'G1',
    accent: '#b3892c',
    url:    'https://g1.globo.com/dynamo/rss2.xml',
    region: 'br',
  },
  {
    id:     'br-jornalismo',
    label:  'Folha',
    accent: '#2c4e7a',
    url:    'https://feeds.folha.uol.com.br/emcimadahora/rss091.xml',
    region: 'br',
  },
  {
    id:     'br-cotidiano',
    label:  'Extra',
    accent: '#275f54',
    url:    'https://extra.globo.com/rss/extra/',
    region: 'br',
  },
  {
    id:     'br-economia',
    label:  'Valor',
    accent: '#6f3a78',
    url:    'https://valor.globo.com/rss/valor/',
    region: 'br',
  },
  {
    id:     'br-mercado',
    label:  'Investing',
    accent: '#4d3a93',
    url:    'https://br.investing.com/rss/news.rss',
    region: 'br',
  },
  {
    id:     'br-esportes',
    label:  'GE',
    accent: '#b85d2a',
    /* Lance.com.br (Next.js) não expõe feed RSS público. Trocamos por
       Globo Esporte, que tem feed nativo com imagens e descrição. */
    url:    'https://ge.globo.com/rss/ge/',
    region: 'br',
  },
  {
    id:     'br-tecnologia',
    label:  'Canaltech',
    accent: '#4f6b3a',
    url:    'https://canaltech.com.br/rss/',
    region: 'br',
  },
  {
    id:     'br-games',
    label:  'Adrenaline',
    accent: '#9c4365',
    /* IGN BR fica atrás do Akamai e recusa conexões server-side (fetch failed).
       Adrenaline/games tem feed WordPress acessível, com imagens grandes. */
    url:    'https://www.adrenaline.com.br/games/feed/',
    region: 'br',
  },
]

/** Todas as seções — usado pela rota /api/feed para validar o `source`. */
export const ALL_SECTIONS: Section[] = [...SECTIONS_WORLD, ...SECTIONS_BR]

export function getSections(region: Region): Section[] {
  return region === 'br' ? SECTIONS_BR : SECTIONS_WORLD
}
