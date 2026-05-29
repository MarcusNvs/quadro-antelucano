'use client'

import { useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import type { FeedItem, Region, Section } from '../lib/types'
import { getSections } from '../lib/sections'
import { SectionNav } from './SectionNav'
import { Article, HeroArticle } from './Article'
import { Skeleton } from './Skeleton'
import shellStyles from './Shell.module.css'
import styles from './Feed.module.css'

// ── Cache em memória por sessão (TTL = 5 min, alinhado ao s-maxage do servidor)

const CACHE_TTL_MS = 5 * 60 * 1000
interface CacheEntry { items: FeedItem[]; expiresAt: number }
const cache = new Map<string, CacheEntry>()

function cacheGet(id: string): FeedItem[] | null {
  const entry = cache.get(id)
  if (!entry) return null
  if (entry.expiresAt < Date.now()) {
    cache.delete(id)
    return null
  }
  return entry.items
}

function cacheSet(id: string, items: FeedItem[]): void {
  cache.set(id, { items, expiresAt: Date.now() + CACHE_TTL_MS })
}

// ── Feed Head (cabeçalho da seção) 

function FeedHead({ section, count }: { section: Section; count: number }) {
  return (
    <div className={styles.head}>
      <h2 className={styles.title}>
        {section.label}<em>.</em>
      </h2>
      <p className={styles.subtitle}>
        Selecionado da edição corrente <span style={{ color: 'var(--section-accent, var(--red))' }}>✦</span> atualizado há instantes
      </p>
      <div className={styles.meta}>
        <span>Seção {section.label}</span>
        <span>{count} {count === 1 ? 'artigo' : 'artigos'}</span>
      </div>
    </div>
  )
}

// ── State (vazio / erro)

function FeedState({
  ornament,
  title,
  message,
}: {
  ornament: string
  title: string
  message?: string
}) {
  return (
    <div className={styles.state}>
      <div className={styles.stateOrnament}>{ornament}</div>
      <div className={styles.stateTitle}>{title}</div>
      {message && <div className={styles.stateMsg}>{message}</div>}
    </div>
  )
}

// ── Grid de artigos

function FeedGrid({ items }: { items: FeedItem[] }) {
  if (items.length === 0) {
    return (
      <FeedState
        ornament="∅"
        title="Nada para ler"
        message="esta seção está vazia esta tarde"
      />
    )
  }

  return (
    <div className={styles.grid}>
      {items.map((item, idx) =>
        idx === 0
          ? <HeroArticle key={item.id} item={item} idx={idx} />
          : <Article     key={item.id} item={item} idx={idx} />
      )}
    </div>
  )
}

// ── Feed Controller (componente principal)

interface FeedControllerProps {
  masthead: ReactNode
  colophon: ReactNode
}

export function FeedController({ masthead, colophon }: FeedControllerProps) {
  const [region,    setRegion]    = useState<Region>('world')
  const [currentId, setCurrentId] = useState<string>(() => getSections('world')[0].id)
  const [items,     setItems]     = useState<FeedItem[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const reqRef    = useRef(0)
  const abortRef  = useRef<AbortController | null>(null)

  const sections = getSections(region)
  const section  = sections.find(s => s.id === currentId) ?? sections[0]

  const loadFeed = useCallback(async (id: string, signal: AbortSignal) => {
    const cached = cacheGet(id)
    if (cached) {
      setItems(cached)
      setLoading(false)
      setError(null)
      return
    }

    const myReq = ++reqRef.current
    setLoading(true)
    setError(null)

    try {
      const res  = await fetch(`/api/feed?source=${encodeURIComponent(id)}`, { signal })
      const data = await res.json()

      if (myReq !== reqRef.current) return

      if (!res.ok || (data.error && !data.items?.length)) {
        setError(data.error ?? `Erro HTTP ${res.status}`)
        setItems([])
      } else {
        const fetched: FeedItem[] = data.items ?? []
        cacheSet(id, fetched)
        setItems(fetched)
      }
    } catch (err) {
      if (signal.aborted || myReq !== reqRef.current) return
      setError(err instanceof Error ? err.message : 'Erro ao buscar o feed')
      setItems([])
    } finally {
      if (myReq === reqRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    loadFeed(section.id, controller.signal)
    return () => controller.abort()
  }, [section.id, loadFeed])

  function handleSelect(id: string) {
    setCurrentId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleRegionChange(next: Region) {
    if (next === region) return
    setRegion(next)
    // Ao trocar de região, vai para a primeira seção da nova lista.
    setCurrentId(getSections(next)[0].id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div
      className={shellStyles.page}
      style={{ '--section-accent': section.accent } as React.CSSProperties}
    >
      {masthead}

      <SectionNav
        sections={sections}
        current={currentId}
        region={region}
        onSelect={handleSelect}
        onRegionChange={handleRegionChange}
      />

      <main className={styles.feed}>
        <FeedHead section={section} count={loading ? 0 : items.length} />

        {loading ? (
          <Skeleton count={6} />
        ) : error ? (
          <FeedState
            ornament="✦"
            title="Edição indisponível"
            message={error}
          />
        ) : (
          <FeedGrid items={items} />
        )}
      </main>

      {colophon}
    </div>
  )
}
