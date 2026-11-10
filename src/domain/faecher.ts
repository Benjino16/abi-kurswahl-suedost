import type { Fach } from './types'

export const FAECHER: Fach[] = [
  { id: 'deutsch', name: 'Deutsch', aufgabenfeld: 1, angebot: ['lk', 'gk', 'mgk'] },
  { id: 'englisch', name: 'Englisch', aufgabenfeld: 1, angebot: ['lk', 'gk', 'mgk'], fremdsprache: true },
  { id: 'russisch', name: 'Russisch', aufgabenfeld: 1, angebot: ['mgk'], fremdsprache: true },
  { id: 'kunst', name: 'Bildende Kunst', aufgabenfeld: 1, angebot: ['lk'] },
  { id: 'ds', name: 'Darstellendes Spiel', aufgabenfeld: 1, angebot: ['ak'] },
  { id: 'geografie', name: 'Geografie', aufgabenfeld: 2, angebot: ['gk', 'mgk', 'ak'], gesellschaftswissenschaft: true },
  { id: 'politik', name: 'Politikwissenschaft', aufgabenfeld: 2, angebot: ['gk', 'mgk', 'ak'], gesellschaftswissenschaft: true },
  { id: 'mathe', name: 'Mathematik', aufgabenfeld: 3, angebot: ['lk', 'gk'] },
  { id: 'biologie', name: 'Biologie', aufgabenfeld: 3, angebot: ['lk', 'ak'], naturwissenschaft: true },
  { id: 'chemie', name: 'Chemie', aufgabenfeld: 3, angebot: ['lk', 'gk', 'mgk', 'ak'], naturwissenschaft: true },
]

const FACH_NACH_ID = new Map(FAECHER.map((f) => [f.id, f]))

export const fach = (id: string): Fach => {
  const f = FACH_NACH_ID.get(id)
  if (!f) throw new Error(`Unbekanntes Fach: ${id}`)
  return f
}

export const istFach = (id: string) => FACH_NACH_ID.has(id)

/** Fach-IDs in der Reihenfolge des Kursangebots. */
export const sortiert = (ids: Iterable<string>): string[] => {
  const menge = new Set(ids)
  return FAECHER.map((f) => f.id).filter((id) => menge.has(id))
}

/** „A, B oder C“ */
export const oderListe = (namen: string[]) =>
  namen.length > 1 ? `${namen.slice(0, -1).join(', ')} oder ${namen.at(-1)}` : (namen[0] ?? '')
