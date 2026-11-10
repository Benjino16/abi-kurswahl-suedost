/** Kursarten: Leistungskurs, Grundkurs (schriftlich), mündlicher Grundkurs, Anrechnungskurs. */
export type Kategorie = 'lk' | 'gk' | 'mgk' | 'ak'

export const KATEGORIEN: { id: Kategorie; label: string }[] = [
  { id: 'lk', label: 'Leistungskurse' },
  { id: 'gk', label: 'Grundkurse (schriftlich)' },
  { id: 'mgk', label: 'Grundkurse (mündlich)' },
  { id: 'ak', label: 'Anrechnungskurse' },
]

export const ALLE: readonly Kategorie[] = ['lk', 'gk', 'mgk', 'ak']
/** Kursarten, deren Fächer schriftlich geprüft werden. */
export const SCHRIFTLICH: readonly Kategorie[] = ['lk', 'gk']

export type SlotId = 'lk1' | 'lk2' | 'gk1' | 'gk2' | 'mgk1' | 'mgk2' | 'ak1' | 'ak2'

export interface Slot {
  id: SlotId
  kategorie: Kategorie
  label: string
}

export const SLOTS: Slot[] = [
  { id: 'lk1', kategorie: 'lk', label: 'LK 1' },
  { id: 'lk2', kategorie: 'lk', label: 'LK 2' },
  { id: 'gk1', kategorie: 'gk', label: 'GK 1' },
  { id: 'gk2', kategorie: 'gk', label: 'GK 2' },
  { id: 'mgk1', kategorie: 'mgk', label: 'mGK 1' },
  { id: 'mgk2', kategorie: 'mgk', label: 'mGK 2' },
  { id: 'ak1', kategorie: 'ak', label: 'AK 1' },
  { id: 'ak2', kategorie: 'ak', label: 'AK 2' },
]

export type Aufgabenfeld = 1 | 2 | 3

export const AUFGABENFELD_LABEL: Record<Aufgabenfeld, string> = { 1: 'I', 2: 'II', 3: 'III' }

export interface Fach {
  id: string
  name: string
  aufgabenfeld: Aufgabenfeld
  /** In welchen Kursarten das Fach angeboten wird. */
  angebot: Kategorie[]
  fremdsprache?: boolean
  gesellschaftswissenschaft?: boolean
  naturwissenschaft?: boolean
}

/** Pro Slot die gewählte Fach-ID (oder `null`, wenn noch leer). */
export type Wahl = Record<SlotId, string | null>

export const leereWahl = (): Wahl => ({
  lk1: null,
  lk2: null,
  gk1: null,
  gk2: null,
  mgk1: null,
  mgk2: null,
  ak1: null,
  ak2: null,
})

export const istVollstaendig = (wahl: Wahl) => SLOTS.every((s) => wahl[s.id] !== null)
