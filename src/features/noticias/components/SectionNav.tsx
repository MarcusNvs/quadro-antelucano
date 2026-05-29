'use client'

import { useEffect, useRef } from 'react'
import type { Region, Section } from '../lib/types'
import styles from './SectionNav.module.css'

interface Props {
  sections:        Section[]
  current:         string
  region:          Region
  onSelect:        (id: string) => void
  onRegionChange:  (region: Region) => void
}

export function SectionNav({
  sections,
  current,
  region,
  onSelect,
  onRegionChange,
}: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  // Carrossel mobile: centraliza o chip ativo ao selecionar ou trocar de
  // região. Rola só o trilho (não a página). No desktop (sem overflow) é no-op.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const active = list.querySelector<HTMLElement>('[aria-selected="true"]')
    if (!active) return
    const target = active.offsetLeft - list.clientWidth / 2 + active.clientWidth / 2
    list.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
  }, [current, region])

  return (
    <nav className={styles.nav} aria-label="Seções">
      <span className={styles.ruleSingle} aria-hidden="true" />

      <div className={styles.bar}>
        <RegionToggle region={region} onChange={onRegionChange} />

        <div ref={listRef} className={styles.inner} role="tablist" aria-label="Veículos">
          {sections.map(s => {
            const selected = s.id === current
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                className={styles.tab}
                onClick={() => onSelect(s.id)}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </div>

      <span className={styles.ruleSingle} aria-hidden="true" />
    </nav>
  )
}

// ── Toggle Mundo / Brasil

function RegionToggle({
  region,
  onChange,
}: {
  region:   Region
  onChange: (region: Region) => void
}) {
  return (
    <div
      className={styles.regionToggle}
      role="radiogroup"
      aria-label="Edição"
    >
      <button
        type="button"
        role="radio"
        aria-checked={region === 'world'}
        aria-label="Edição internacional"
        title="Edição internacional"
        className={styles.regionBtn}
        onClick={() => onChange('world')}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/globe.png"
          alt="Edição internacional"
          className={styles.regionIcon}
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={region === 'br'}
        aria-label="Edição brasileira"
        title="Edição brasileira"
        className={styles.regionBtn}
        onClick={() => onChange('br')}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/brazil.png"
          alt="Edição brasileira"
          className={styles.regionIcon}
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
      </button>
    </div>
  )
}
