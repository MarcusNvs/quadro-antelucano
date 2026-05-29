/* Helpers de formatação compartilhados — sem dependências, sem efeitos. */

const ROMAN: ReadonlyArray<readonly [string, number]> = [
  ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
  ['C', 100],  ['XC', 90],  ['L', 50],  ['XL', 40],
  ['X', 10],   ['IX', 9],   ['V', 5],   ['IV', 4], ['I', 1],
]

/** Converte um inteiro positivo em numeral romano. */
export function romanize(n: number): string {
  let remaining = Math.max(0, Math.floor(n))
  let out = ''
  for (const [glyph, value] of ROMAN) {
    while (remaining >= value) { out += glyph; remaining -= value }
  }
  return out
}
