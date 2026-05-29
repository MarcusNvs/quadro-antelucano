import { NextRequest, NextResponse } from 'next/server'
import { ALL_SECTIONS } from '@/features/noticias/lib/sections'
import { parseFeed } from '@/features/noticias/lib/feed-parser'
import type { FeedItem } from '@/features/noticias/lib/types'

/* Sempre dinâmico: não deixamos o Next cachear a rota nem o fetch.
   O frescor é controlado pelo nosso próprio cache em memória abaixo,
   que é determinístico (TTL fixo, reseta no restart). */
export const dynamic  = 'force-dynamic'
export const revalidate = 0

// ── Cache em memória do servidor ──
//   FRESH: dentro disso, serve direto sem rebuscar (perf + anti-rate-limit).
//   STALE: se o fetch falhar (ex: NASA 429), serve o último bom até este limite
//          em vez de mostrar "Feed indisponível".

const FRESH_MS = 5 * 60 * 1000          // 5 min
const STALE_MS = 24 * 60 * 60 * 1000    // 24 h

interface CacheEntry { items: FeedItem[]; fetchedAt: number }
const memCache = new Map<string, CacheEntry>()

/* User-Agent de browser real: NASA, IGN (Akamai) e outros bloqueiam
   clientes não-browser com 403/429. */
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' }

export async function GET(req: NextRequest) {
  const sourceId = req.nextUrl.searchParams.get('source')
  const section  = ALL_SECTIONS.find(s => s.id === sourceId)

  if (!section) {
    return NextResponse.json(
      { error: `Seção desconhecida: "${sourceId}"` },
      { status: 400, headers: NO_STORE }
    )
  }

  const now    = Date.now()
  const cached = memCache.get(section.id)

  // Cache fresco — serve direto
  if (cached && now - cached.fetchedAt < FRESH_MS) {
    return NextResponse.json({ items: cached.items }, { headers: NO_STORE })
  }

  try {
    const res = await fetch(section.url, {
      headers: {
        'Accept':     'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
        'User-Agent': BROWSER_UA,
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ao buscar ${section.url}`)
    }

    // Folha entrega ISO-8859-1; lemos bytes e decodificamos pelo charset real.
    const buf     = await res.arrayBuffer()
    const charset = detectCharset(buf, res.headers.get('content-type'))
    const xml     = decode(buf, charset)
    const items   = parseFeed(xml, section)

    memCache.set(section.id, { items, fetchedAt: now })
    return NextResponse.json({ items }, { headers: NO_STORE })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error(`[/api/feed] Falha ao buscar "${sourceId}":`, message)

    // Fallback: serve o último cache bom (mesmo expirado) se ainda recente.
    // Crucial para feeds que rate-limitam, como a NASA (429).
    if (cached && now - cached.fetchedAt < STALE_MS) {
      return NextResponse.json(
        { items: cached.items, stale: true },
        { headers: NO_STORE }
      )
    }

    return NextResponse.json(
      { items: [], error: message },
      { status: 502, headers: NO_STORE }
    )
  }
}

// ── Charset detection ─

function detectCharset(buf: ArrayBuffer, contentType: string | null): string {
  const head = new TextDecoder('ascii').decode(buf.slice(0, 256))
  const xmlMatch = head.match(/<\?xml[^>]*encoding=["']([^"']+)["']/i)
  if (xmlMatch) return normalize(xmlMatch[1])

  if (contentType) {
    const ctMatch = contentType.match(/charset=([^;\s]+)/i)
    if (ctMatch) return normalize(ctMatch[1])
  }
  return 'utf-8'
}

function normalize(charset: string): string {
  const c = charset.toLowerCase().trim()
  if (c === 'latin1' || c === 'latin-1') return 'iso-8859-1'
  return c
}

function decode(buf: ArrayBuffer, charset: string): string {
  try {
    return new TextDecoder(charset, { fatal: false }).decode(buf)
  } catch {
    return new TextDecoder('utf-8', { fatal: false }).decode(buf)
  }
}
