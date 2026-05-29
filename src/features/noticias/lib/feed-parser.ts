/* ============================================================
   Feed Parser — server-side only (Node.js, no DOMParser).
   Parses RSS 2.0 and Atom 1.0 via regex / string ops.
   No external dependencies required.
   ============================================================ */

import type { FeedItem, Section } from './types'
import { upgradeImageQuality } from './image-upgrade'

const MAX_ITEMS = 50
const MAX_DESCRIPTION = 320

/* Hosts de thumbnail do Reddit que retornam 403 sem cookies/Referer.
   Quando aparecem em <media:thumbnail>, são ignorados em favor do
   preview real (i.redd.it / preview.redd.it) extraído do conteúdo. */
const BLOCKED_IMAGE_HOSTS = /(?:^|\.)(?:a|b)\.thumbs\.redditmedia\.com$/i

/* Boilerplate típico de feeds Atom do Reddit: o <content> só carrega
   "submitted by /u/foo [link] [comments]" — texto sem valor editorial. */
const REDDIT_BOILERPLATE = /\b(?:submitted by\s*\/u\/\S+|\[link\]|\[comments\])/gi

/* Blocos de "Leia Mais / Veja também / Conteúdo relacionado" embutidos no
   <content:encoded> — CNN Brasil, G1, Folha etc. colocam ali as imagens
   de matérias relacionadas, o que faria o parser pegar imagem errada. */
const RELATED_BLOCK = new RegExp(
  '<(aside|div|section|ul)\\b[^>]*' +
  '(?:class|id)\\s*=\\s*["\'][^"\']*' +
  '(?:read-too|read_too|related|leia[-_]?mais|leia[-_]?tambem|recommended|recommend|veja[-_]?tambem|conteudo[-_]?relacionado|posts?[-_]?relacionados?)' +
  '[^"\']*["\'][^>]*>[\\s\\S]*?<\\/\\1>',
  'gi'
)

// ── Helpers───

/** Unwrap CDATA and trim. */
function unwrap(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
}

/** Decode HTML entities — handles surrogate pairs and astral codepoints. */
function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeFromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g,         (_, n) => safeFromCodePoint(parseInt(n, 10)))
    .replace(/&amp;/g,  '&')
}

/** String.fromCodePoint com fallback seguro (codepoints inválidos viram ''). */
function safeFromCodePoint(cp: number): string {
  if (!Number.isFinite(cp) || cp < 0 || cp > 0x10FFFF) return ''
  return String.fromCodePoint(cp)
}

/** Strip HTML tags, collapse whitespace.
 *  Two-pass decode handles double-encoded content (e.g. Reddit &amp;lt;table&amp;gt;). */
function stripHtml(s: string): string {
  const pass1 = decodeEntities(s).replace(/<[^>]*>/g, ' ')
  const pass2 = decodeEntities(pass1).replace(/<[^>]*>/g, ' ')
  return pass2.replace(/\s+/g, ' ').trim()
}

/** Slice em fronteira de palavra com elipse — evita cortes feios no meio da palavra. */
function clampText(s: string, max: number): string {
  if (s.length <= max) return s
  const cut = s.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…'
}

/** Limpa boilerplate do Reddit. Se o resultado for muito curto, retorna ''. */
function cleanBoilerplate(s: string): string {
  const cleaned = s.replace(REDDIT_BOILERPLATE, ' ').replace(/\s+/g, ' ').trim()
  return cleaned.length >= 24 ? cleaned : ''
}

/** Extract first occurrence of a tag's text content. */
function tag(xml: string, name: string): string {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i')
  const m = xml.match(re)
  return m ? unwrap(m[1].trim()) : ''
}

/** Extract attribute value from a tag. Accepts single or double quotes. */
function attr(xml: string, tagName: string, attrName: string): string {
  const re = new RegExp(
    `<${tagName}[^>]*\\s${attrName}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`,
    'i'
  )
  const m = xml.match(re)
  return m ? (m[1] ?? m[2] ?? '') : ''
}

/** Split XML into individual item/entry blocks. */
function splitItems(xml: string, itemTag: string): string[] {
  const re = new RegExp(`<${itemTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${itemTag}>`, 'gi')
  const items: string[] = []
  let m
  while ((m = re.exec(xml)) !== null) {
    items.push(m[1])
  }
  return items
}

/** Hostname seguro: retorna null se inválido. */
function hostOf(url: string): string | null {
  try { return new URL(url).hostname } catch { return null }
}

/** Reddit prefere preview.redd.it / i.redd.it (URLs públicas e diretas)
 *  sobre b.thumbs.redditmedia.com (403 sem cookies). */
function pickRedditImage(decodedBody: string): string | null {
  // 1. <a href="https://i.redd.it/..."> ou preview.redd.it — link da imagem original
  const hrefMatch = decodedBody.match(
    /href=["'](https:\/\/(?:i|preview)\.redd\.it\/[^"']+)["']/i
  )
  if (hrefMatch) return hrefMatch[1]

  // 2. src= apontando para o mesmo CDN
  const srcMatch = decodedBody.match(
    /src=["'](https:\/\/(?:i|preview|external-preview)\.redd\.it\/[^"']+)["']/i
  )
  if (srcMatch) return srcMatch[1]

  return null
}

/** Try to extract a usable image URL from an item block. */
function extractImage(itemXml: string): string | null {
  const raw = extractImageRaw(itemXml)
  if (!raw) return null
  const upgraded = upgradeImageQuality(raw)
  // Só HTTPS (evita mixed content). O host é livre — as imagens são
  // servidas sem otimização (unoptimized), então não há crash de host.
  if (!upgraded.startsWith('https://')) return null
  // Descarta vídeos e iframes de embed que escapam para o corpo.
  if (isVideoOrEmbed(upgraded)) return null
  // Placeholders genéricos / thumbs minúsculas ficam horríveis ampliadas:
  // melhor card só-texto (elegante no design jornal) do que imagem borrada.
  if (isPlaceholderOrTiny(upgraded)) return null
  return upgraded
}

/** Descarta URLs de vídeo (.mp4 etc.) e de embeds (iframes de "stories"). */
function isVideoOrEmbed(url: string): boolean {
  if (/\.(mp4|webm|mov|avi|mkv|m3u8|mxf)(\?|#|$)/i.test(url)) return true
  if (/\/embed\//i.test(url)) return true
  return false
}

/** Detecta placeholders e thumbnails minúsculas pelo nome do arquivo. */
function isPlaceholderOrTiny(url: string): boolean {
  // Placeholder genérico do Investing (ex: world_news_2_108x81.jpg)
  if (/\/world_news_\d+_\d+x\d+\./i.test(url)) return true
  // Dimensões explícitas no nome (ex: _108x81, -150x150): ambos lados < 200
  const m = url.match(/[_/-](\d{2,4})x(\d{2,4})(?:[._-]|$)/)
  if (m) {
    const w = parseInt(m[1], 10)
    const h = parseInt(m[2], 10)
    if (w < 200 && h < 200) return true
  }
  return false
}

function extractImageRaw(itemXml: string): string | null {
  // Decode early — Reddit's <content> é HTML duplo-encodado.
  const rawBody =
    tag(itemXml, 'content:encoded') ||
    tag(itemXml, 'content') ||
    tag(itemXml, 'description') ||
    tag(itemXml, 'summary')
  // Remove blocos de "Leia Mais" antes de procurar imagens — senão
  // pegamos a thumbnail de uma matéria relacionada em vez da do post.
  const cleaned     = rawBody.replace(RELATED_BLOCK, ' ')
  const decodedBody = decodeEntities(decodeEntities(cleaned))

  // 0. Reddit: pegar preview real do corpo antes de cair em thumbnails bloqueadas
  const reddit = pickRedditImage(decodedBody)
  if (reddit) return reddit

  // 1. media:thumbnail — exceto hosts bloqueados
  const thumb = attr(itemXml, 'media:thumbnail', 'url')
  if (thumb && isUsable(thumb)) return thumb

  // 2. media:content com tipo/extensão de imagem
  const mediaUrl = attr(itemXml, 'media:content', 'url')
  if (mediaUrl && isUsable(mediaUrl)) {
    if (/\.(jpe?g|png|gif|webp)(\?|$)/i.test(mediaUrl)) return mediaUrl
    if (attr(itemXml, 'media:content', 'medium') === 'image') return mediaUrl
  }

  // 3. enclosure com tipo de imagem
  const encType = attr(itemXml, 'enclosure', 'type')
  if (encType?.startsWith('image')) {
    const encUrl = attr(itemXml, 'enclosure', 'url')
    if (encUrl && isUsable(encUrl)) return encUrl
  }

  // 4. URLs com extensão de imagem no HTML decodificado
  const extMatch = decodedBody.match(
    /src=["'](https:\/\/[^"']+\.(?:jpe?g|png|gif|webp)(?:\?[^"']*)?)["']/i
  )
  if (extMatch && isUsable(extMatch[1])) return extMatch[1]

  // 5. URLs com format= explícito (Reddit preview CDN, etc.)
  const fmtMatch = decodedBody.match(
    /src=["'](https:\/\/[^"']+[?&]format=(?:png|jpe?g|gif|webp)[^"']*)["']/i
  )
  if (fmtMatch && isUsable(fmtMatch[1])) return fmtMatch[1]

  // 6. Fallback: primeira <img> https no corpo.
  //    Exige a tag <img> para não capturar <video>/<source>/<iframe>.
  const imgMatch = decodedBody.match(/<img\b[^>]*?\ssrc=["'](https:\/\/[^"']+)["']/i)
  if (imgMatch && isUsable(imgMatch[1])) return imgMatch[1]

  return null
}

/** Aceita só https e descarta thumbnails bloqueadas (thumbs do Reddit dão 403). */
function isUsable(url: string): boolean {
  if (!url.startsWith('https://')) return false
  const host = hostOf(url)
  return host !== null && !BLOCKED_IMAGE_HOSTS.test(host)
}

/** Format a date relative to now (PT-BR style). */
function formatDate(raw: string): string {
  if (!raw) return ''
  const date = parseDate(raw)
  if (!date) return ''

  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 3600)   return `${Math.max(1, Math.round(diff / 60))} min`
  if (diff < 86400)  return `${Math.round(diff / 3600)} h`
  if (diff < 604800) return `${Math.round(diff / 86400)} d`

  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

/* Parse robusto: aceita RFC 822, ISO 8601, e formato "YYYY-MM-DD HH:MM:SS"
   sem timezone (Investing usa esse). Sem TZ, assume UTC para não vazar o
   fuso do servidor de execução. */
function parseDate(raw: string): Date | null {
  let s = raw.trim()
  // Formato "YYYY-MM-DD HH:MM:SS" — força ISO e UTC
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?$/.test(s)) {
    s = s.replace(' ', 'T') + 'Z'
  }
  const date = new Date(s)
  return isNaN(date.getTime()) ? null : date
}

/** Constrói description limpa, tirando boilerplate e cortando em palavra. */
function buildDescription(raw: string): string {
  const stripped = stripHtml(raw)
  const cleaned  = cleanBoilerplate(stripped)
  return clampText(cleaned, MAX_DESCRIPTION)
}

// ── RSS 2.0───

function parseRssItem(itemXml: string, section: Section, idx: number): FeedItem | null {
  const title = stripHtml(tag(itemXml, 'title'))
  const link  = tag(itemXml, 'link') || attr(itemXml, 'link', 'href')
  if (!title || !link) return null

  const rawDate = tag(itemXml, 'pubDate') || tag(itemXml, 'dc:date')

  return {
    id:            `${section.id}-${idx}`,
    title,
    link,
    image:         extractImage(itemXml),
    description:   buildDescription(tag(itemXml, 'description')),
    rawDate,
    formattedDate: formatDate(rawDate),
    source:        section,
  }
}

// ── Atom 1.0

function parseAtomEntry(entryXml: string, section: Section, idx: number): FeedItem | null {
  const title = stripHtml(tag(entryXml, 'title'))

  // Atom <link> pode ser: <link href="..." rel="alternate"> ou <link href="...">
  const altLinkMatch = entryXml.match(/<link[^>]*(?:rel="alternate"[^>]*href|href[^>]*rel="alternate")[^>]*"([^"]+)"/i)
  const anyLinkMatch = entryXml.match(/<link[^>]*href="([^"]+)"/i)
  const link = altLinkMatch?.[1] ?? anyLinkMatch?.[1] ?? tag(entryXml, 'link')

  if (!title || !link) return null

  const rawDate =
    tag(entryXml, 'published') ||
    tag(entryXml, 'updated')

  const description = buildDescription(
    tag(entryXml, 'summary') || tag(entryXml, 'content')
  )

  return {
    id:            `${section.id}-${idx}`,
    title,
    link,
    image:         extractImage(entryXml),
    description,
    rawDate,
    formattedDate: formatDate(rawDate),
    source:        section,
  }
}

// ── Public API

export function parseFeed(xml: string, section: Section): FeedItem[] {
  const isAtom = /<feed[\s>]/i.test(xml) || /<entry[\s>]/i.test(xml)

  if (isAtom) {
    return splitItems(xml, 'entry')
      .slice(0, MAX_ITEMS)
      .map((entry, i) => parseAtomEntry(entry, section, i))
      .filter((item): item is FeedItem => item !== null)
  }

  return splitItems(xml, 'item')
    .slice(0, MAX_ITEMS)
    .map((item, i) => parseRssItem(item, section, i))
    .filter((item): item is FeedItem => item !== null)
}
