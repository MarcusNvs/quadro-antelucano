import styles from './Skeleton.module.css'

interface Props {
  count?: number
}

export function Skeleton({ count = 6 }: Props) {
  return (
    <div className={styles.grid} aria-hidden="true" aria-label="Carregando artigos…">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.card}>
          <span className={styles.rule} />
          <div className={`${styles.line} ${styles.lineShort}`} />
          {i === 0 && <div className={styles.block} />}
          <div className={`${styles.line} ${styles.lineMid}`} />
          <div className={`${styles.line} ${styles.lineFull}`} />
          <div className={`${styles.line} ${styles.lineMid}`} />
        </div>
      ))}
    </div>
  )
}
