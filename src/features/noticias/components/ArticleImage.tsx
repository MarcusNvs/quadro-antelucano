'use client'

import { Component, useState, type ReactNode } from 'react'
import Image from 'next/image'
import styles from './ArticleImage.module.css'

/* O <Image> do Next LANÇA durante o render se o hostname não estiver em
   remotePatterns. Com o custom loader isso não deve mais ocorrer, mas o
   Error Boundary fica como rede de segurança: em vez de derrubar a página,
   cai no mesmo placeholder do erro de carregamento. */
class ImageBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    /* engolido de propósito — mostramos o fallback */
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

interface Props {
  src:       string
  alt:       string
  wrapClass: string
  imgClass:  string
  sizes:     string
  priority?: boolean
}

/** Imagem de artigo resiliente: se a URL falhar (404/expirada) ou o host
 *  não estiver configurado, mostra uma "gravura vazia" com ornamento — o
 *  card mantém o layout em vez de quebrar/encolher. */
export function ArticleImage({ src, alt, wrapClass, imgClass, sizes, priority }: Props) {
  const [failed, setFailed] = useState(false)

  const placeholder = (
    <div className={`${wrapClass} ${styles.fallback}`} aria-hidden="true">
      <span className={styles.ornament}>✦</span>
    </div>
  )

  if (failed) return placeholder

  return (
    <ImageBoundary fallback={placeholder}>
      <div className={wrapClass}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          referrerPolicy="no-referrer"
          className={imgClass}
          onError={() => setFailed(true)}
        />
      </div>
    </ImageBoundary>
  )
}
