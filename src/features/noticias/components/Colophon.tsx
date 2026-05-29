import styles from './Colophon.module.css'

export function Colophon() {
  return (
    <footer className={styles.colophon}>
      <span className={styles.rule} />
      <p className={styles.text}>
        Quadro Antelucano
        <span className={styles.sep}>·</span>
        O jornal antes do amanhecer
        <span className={styles.sep}>·</span>
        Composto em Libre Baskerville
        <span className={styles.sep}>·</span>
        MMXXVI
      </p>
    </footer>
  )
}
