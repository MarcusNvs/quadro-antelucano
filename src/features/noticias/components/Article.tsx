'use client'

import { useEffect, useRef, useState } from 'react'
import type { FeedItem } from '../lib/types'
import { romanize } from '../lib/format'
import { ArticleImage } from './ArticleImage'
import styles from './Article.module.css'

/* Sizes alinhados ao grid em Feed.module.css:
   mobile 1col (100vw), tablet 2col (50vw), desktop 3col (~33vw). */
const ARTICLE_SIZES = '(min-width: 960px) 33vw, (min-width: 640px) 50vw, 100vw'
const HERO_SIZES    = '(min-width: 960px) 960px, 100vw'

// ── Hook: IntersectionObserver para fade-in
function useInView(idx: number) {
  const ref = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Fallback: garante visibilidade mesmo que o IO não dispare
    const safety = setTimeout(() => setInView(true), 100 + Math.min(idx, 8) * 60)

    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            clearTimeout(safety)
            setInView(true)
            io.unobserve(el)
          }
        }
      },
      { rootMargin: '100px 0px', threshold: 0.05 }
    )

    io.observe(el)
    return () => { clearTimeout(safety); io.disconnect() }
  }, [idx])

  return { ref, inView }
}

// ── Excerpt com capitular
// Primeira letra como <span> real (não ::first-letter): funciona em
// qualquer layout, sem o bug de corte/deslocamento com colunas/line-clamp.

function Excerpt({ text, className }: { text: string; className: string }) {
  const first = text.charAt(0).toUpperCase()
  const rest  = text.slice(1)
  return (
    <p className={className}>
      <span className={styles.dropCap}>{first}</span>{rest}
    </p>
  )
}

// ── Article regular

interface ArticleProps {
  item: FeedItem
  idx:  number
}

export function Article({ item, idx }: ArticleProps) {
  const { ref, inView } = useInView(idx)
  const indexLabel = `N° ${romanize(idx + 1)}`
  // O parser já garante URL https usável; o custom loader aceita qualquer host.
  const safeImage = item.image

  return (
    <article
      ref={ref as React.RefObject<HTMLElement>}
      className={`${styles.article}${inView ? ` ${styles.inView}` : ''}`}
      style={{ '--article-accent': item.source.accent } as React.CSSProperties}
    >
      <span className={styles.rule} aria-hidden="true" />

      <div className={styles.kicker}>
        <span className={styles.kickerLeft}>
          <span className={styles.source}>{item.source.label}</span>
          <span className={styles.sep}>·</span>
          <span className={styles.date}>{item.formattedDate}</span>
        </span>
        <span className={styles.index}>{indexLabel}</span>
      </div>

      {safeImage && (
        <ArticleImage
          src={safeImage}
          alt={item.title}
          wrapClass={styles.imageWrap}
          imgClass={styles.articleImg}
          sizes={ARTICLE_SIZES}
        />
      )}

      <h3 className={styles.headline}>
        <a
          className={styles.link}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {item.title}<em>.</em>
        </a>
      </h3>

      {item.description && (
        <Excerpt text={item.description} className={styles.excerpt} />
      )}
    </article>
  )
}

// ── Hero Article (manchete)

export function HeroArticle({ item, idx }: ArticleProps) {
  const { ref, inView } = useInView(idx)
  const indexLabel = `N° ${romanize(idx + 1)}`
  const safeImage = item.image

  return (
    <article
      ref={ref as React.RefObject<HTMLElement>}
      className={`${styles.heroArticle}${inView ? ` ${styles.inView}` : ''}`}
      style={{ '--article-accent': item.source.accent } as React.CSSProperties}
    >
      <div className={styles.eyebrow}>
        <span className={styles.star}>✦</span>
        <span>Manchete da edição · {indexLabel}</span>
        <span className={styles.star}>✦</span>
      </div>

      <span className={styles.rule} aria-hidden="true" />

      <div className={styles.kicker}>
        <span className={styles.kickerLeft}>
          <span className={styles.source}>{item.source.label}</span>
          <span className={styles.sep}>·</span>
          <span className={styles.date}>{item.formattedDate}</span>
        </span>
        <span className={styles.index}>{indexLabel}</span>
      </div>

      {safeImage && (
        <ArticleImage
          src={safeImage}
          alt={item.title}
          wrapClass={styles.heroImageWrap}
          imgClass={styles.heroImg}
          sizes={HERO_SIZES}
          priority={idx === 0}
        />
      )}

      <h2 className={styles.headline}>
        <a
          className={styles.heroLink}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {item.title}<em>.</em>
        </a>
      </h2>

      {item.description && (
        <Excerpt text={item.description} className={styles.excerpt} />
      )}
    </article>
  )
}
