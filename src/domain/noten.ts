import { SCHRIFTLICH, SLOTS, type Kategorie, type Slot, type SlotId } from './types'

/** Punkte (0–15) pro Slot oder `null`, solange noch keine Note eingetragen ist. */
export type Punkte = Record<SlotId, number | null>

export const leerePunkte = (): Punkte => Object.fromEntries(SLOTS.map((s) => [s.id, null])) as Punkte

export const MAX_PUNKTE = 15

/** Faktor, mit dem die Punkte eines Kurses in die Gesamtwertung eingehen. */
export const GEWICHT: Record<Kategorie, number> = { lk: 13, gk: 9, mgk: 4, ak: 4 }

/** Notenstufe zu 0 bis 15 Punkten. */
const NOTEN = ['6', '5-', '5', '5+', '4-', '4', '4+', '3-', '3', '3+', '2-', '2', '2+', '1-', '1', '1+']

export const notenstufe = (punkte: number) => NOTEN[punkte]

const istSchriftlich = (s: Slot) => SCHRIFTLICH.includes(s.kategorie)
const SCHRIFTLICHE = SLOTS.filter(istSchriftlich)
const MUENDLICHE = SLOTS.filter((s) => !istSchriftlich(s))

/** Summe der gewichteten Punkte der angegebenen Slots. */
export const gewertet = (punkte: Record<SlotId, number>, slots = SLOTS) =>
  slots.reduce((summe, s) => summe + punkte[s.id] * GEWICHT[s.kategorie], 0)

export const MAX_GESAMT = gewertet(Object.fromEntries(SLOTS.map((s) => [s.id, MAX_PUNKTE])) as Record<SlotId, number>)

/**
 * Abiturnote nach 17/3 − Punkte/180, auf eine Nachkommastelle abgeschnitten
 * (nicht gerundet) und nach oben auf 1,0 begrenzt. Gerechnet wird in Zehnteln,
 * damit keine Gleitkommafehler die Stufengrenzen verschieben.
 */
export const abiturnote = (gesamt: number) => Math.max(10, Math.floor((1020 - gesamt) / 18)) / 10

export const MIN_SCHRIFTLICH = 220
export const MIN_MUENDLICH = 80
const MIN_KURS = 5

export interface NotenRegel {
  id: string
  titel: string
  beschreibung: string
  /** Liefert eine Meldung pro Verstoß; leer, wenn die Regel erfüllt ist. */
  pruefe: (punkte: Record<SlotId, number>) => string[]
}

const mindestensFuenf = (punkte: Record<SlotId, number>, slots: Slot[]) =>
  slots.filter((s) => punkte[s.id] >= MIN_KURS)

export const NOTEN_REGELN: NotenRegel[] = [
  {
    id: 'keine-null',
    titel: 'Kein Kurs mit 0 Punkten',
    beschreibung: 'Jeder der acht Kurse muss mit mindestens 1 Punkt abgeschlossen werden.',
    pruefe: (punkte) => {
      const ohne = SLOTS.filter((s) => punkte[s.id] === 0)
      return ohne.length ? [`0 Punkte in ${ohne.map((s) => s.label).join(', ')}.`] : []
    },
  },
  {
    id: 'schriftlich-fuenf',
    titel: 'Zwei schriftliche Kurse mit mindestens 5 Punkten',
    beschreibung:
      'In mindestens zwei schriftlichen Kursen, darunter mindestens einem Leistungskurs, müssen mindestens 5 Punkte (einfache Wertung) erreicht werden.',
    pruefe: (punkte) => {
      const fehler: string[] = []
      const gut = mindestensFuenf(punkte, SCHRIFTLICHE)
      if (!gut.some((s) => s.kategorie === 'lk')) fehler.push('Kein Leistungskurs mit mindestens 5 Punkten.')
      if (gut.length < 2) fehler.push(`Nur ${gut.length} von 2 nötigen schriftlichen Kursen mit mindestens 5 Punkten.`)
      return fehler
    },
  },
  {
    id: 'muendlich-fuenf',
    titel: 'Zwei mündliche Kurse mit mindestens 5 Punkten',
    beschreibung: 'In mindestens zwei mündlichen Kursen (mGK und AK) müssen mindestens 5 Punkte (einfache Wertung) erreicht werden.',
    pruefe: (punkte) => {
      const gut = mindestensFuenf(punkte, MUENDLICHE)
      return gut.length < 2 ? [`Nur ${gut.length} von 2 nötigen mündlichen Kursen mit mindestens 5 Punkten.`] : []
    },
  },
  {
    id: 'schriftlich-summe',
    titel: `Mindestens ${MIN_SCHRIFTLICH} Punkte in den schriftlichen Kursen`,
    beschreibung: `Die gewichteten Punkte aus LK (×${GEWICHT.lk}) und GK (×${GEWICHT.gk}) müssen zusammen mindestens ${MIN_SCHRIFTLICH} ergeben.`,
    pruefe: (punkte) => {
      const summe = gewertet(punkte, SCHRIFTLICHE)
      return summe < MIN_SCHRIFTLICH ? [`Erreicht: ${summe} von ${MIN_SCHRIFTLICH} Punkten.`] : []
    },
  },
  {
    id: 'muendlich-summe',
    titel: `Mindestens ${MIN_MUENDLICH} Punkte in den mündlichen Kursen`,
    beschreibung: `Die gewichteten Punkte aus mGK (×${GEWICHT.mgk}) und AK (×${GEWICHT.ak}) müssen zusammen mindestens ${MIN_MUENDLICH} ergeben.`,
    pruefe: (punkte) => {
      const summe = gewertet(punkte, MUENDLICHE)
      return summe < MIN_MUENDLICH ? [`Erreicht: ${summe} von ${MIN_MUENDLICH} Punkten.`] : []
    },
  },
]

export interface NotenVerstoss {
  regel: NotenRegel
  meldung: string
}

export const pruefeNoten = (punkte: Record<SlotId, number>): NotenVerstoss[] =>
  NOTEN_REGELN.flatMap((regel) => regel.pruefe(punkte).map((meldung) => ({ regel, meldung })))

/** Alle Punkte, sobald jeder Kurs eine Note hat – sonst `null`. */
export const vollstaendigePunkte = (punkte: Punkte): Record<SlotId, number> | null =>
  SLOTS.every((s) => punkte[s.id] !== null) ? (punkte as Record<SlotId, number>) : null
