import styles from './Masthead.module.css'
import { romanize } from '../lib/format'

/* Timezone fixo para coerência entre o servidor (Vercel/UTC) e o leitor (BR).
   Sem isto, a data e o número da edição podem mudar conforme o fuso do host. */
const TZ = 'America/Sao_Paulo'

function ptDateLong(d = new Date()): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday:  'long',
    day:      'numeric',
    month:    'long',
    year:     'numeric',
    timeZone: TZ,
  })
    .format(d)
    .replace(/^./, c => c.toUpperCase())
}

/* Edição dinâmica: dias decorridos desde 2026-01-01 em America/Sao_Paulo. */
function editionNumber(): number {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: TZ,
  })
  // en-CA produz YYYY-MM-DD — parseável de volta como data local de SP em UTC midnight
  const today = new Date(`${fmt.format(new Date())}T00:00:00Z`).getTime()
  const start = Date.UTC(2026, 0, 1)
  return Math.max(1, Math.floor((today - start) / 86_400_000) + 1)
}

export function Masthead() {
  const edition = editionNumber()
  const date    = ptDateLong()

  return (
    <header className={styles.masthead}>
      <span className={styles.ruleDouble} aria-hidden="true" />
      <div className={styles.edition}>
        <span>Edição N°&thinsp;{romanize(edition)}</span>
        <span>{date}</span>
      </div>
      <span className={styles.ruleDouble} aria-hidden="true" />
      <h1 className={styles.title}>
        Quadro Antelucano<em>.</em>
      </h1>
      <p className={styles.tagline}>
        O jornal antes do amanhecer <span>·</span> atualizado a cada edição
      </p>
    </header>
  )
}
