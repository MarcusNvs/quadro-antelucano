import { describe, it, expect, vi } from 'vitest'
import { parseFeed } from './feed-parser'
import type { Section } from './types'

const section: Section = {
  id:     'test',
  label:  'Test',
  accent: '#000000',
  url:    'https://example.com',
  region: 'world',
}

const rss = (inner: string) =>
  `<rss version="2.0"><channel>${inner}</channel></rss>`

describe('parseFeed — RSS 2.0', () => {
  it('extrai título e link', () => {
    const items = parseFeed(
      rss('<item><title>Olá</title><link>https://a.com/post</link></item>'),
      section,
    )
    expect(items).toHaveLength(1)
    expect(items[0].title).toBe('Olá')
    expect(items[0].link).toBe('https://a.com/post')
  })

  it('desembrulha CDATA no título', () => {
    const items = parseFeed(
      rss('<item><title><![CDATA[Café & Notícia]]></title><link>https://a.com/x</link></item>'),
      section,
    )
    expect(items[0].title).toBe('Café & Notícia')
  })

  it('decodifica entidades astrais / emoji (fromCodePoint)', () => {
    const items = parseFeed(
      rss('<item><title>Sol &#x1F600;</title><link>https://a.com/x</link></item>'),
      section,
    )
    expect(items[0].title).toBe('Sol 😀')
  })

  it('extrai imagem de media:content', () => {
    const items = parseFeed(
      rss('<item><title>t</title><link>https://a.com/x</link><media:content url="https://cdn.com/foto.jpg" medium="image"/></item>'),
      section,
    )
    expect(items[0].image).toBe('https://cdn.com/foto.jpg')
  })

  it('extrai a primeira <img> do corpo', () => {
    const items = parseFeed(
      rss('<item><title>t</title><link>https://a.com/x</link><description><![CDATA[<p><img src="https://cdn.com/b.jpg"></p> texto]]></description></item>'),
      section,
    )
    expect(items[0].image).toBe('https://cdn.com/b.jpg')
  })

  it('ignora vídeo .mp4 no corpo (não trata como imagem)', () => {
    const items = parseFeed(
      rss('<item><title>t</title><link>https://a.com/x</link><description><![CDATA[<video><source src="https://cdn.com/v.mp4"></video>]]></description></item>'),
      section,
    )
    expect(items[0].image).toBeNull()
  })

  it('limpa boilerplate do Reddit da descrição', () => {
    const items = parseFeed(
      rss('<item><title>t</title><link>https://a.com/x</link><description><![CDATA[submitted by /u/foo <a href="x">[link]</a> <a href="y">[comments]</a>]]></description></item>'),
      section,
    )
    expect(items[0].description).toBe('')
  })

  it('descarta itens sem título ou sem link', () => {
    const items = parseFeed(
      rss('<item><title>sem link</title></item><item><title>ok</title><link>https://a.com/ok</link></item>'),
      section,
    )
    expect(items).toHaveLength(1)
    expect(items[0].title).toBe('ok')
  })

  it('limita a 50 itens', () => {
    const many = Array.from(
      { length: 60 },
      (_, i) => `<item><title>t${i}</title><link>https://a.com/${i}</link></item>`,
    ).join('')
    expect(parseFeed(rss(many), section)).toHaveLength(50)
  })

  it('trata data sem timezone como UTC', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-28T12:00:00Z'))
    const items = parseFeed(
      rss('<item><title>t</title><link>https://a.com/x</link><pubDate>2026-05-28 10:00:00</pubDate></item>'),
      section,
    )
    expect(items[0].formattedDate).toBe('2 h')
    vi.useRealTimers()
  })
})

describe('parseFeed — Atom 1.0', () => {
  it('extrai entry com link rel="alternate"', () => {
    const xml =
      '<feed><entry><title>Atom Post</title><link rel="alternate" href="https://a.com/atom"/></entry></feed>'
    const items = parseFeed(xml, section)
    expect(items).toHaveLength(1)
    expect(items[0].title).toBe('Atom Post')
    expect(items[0].link).toBe('https://a.com/atom')
  })
})
