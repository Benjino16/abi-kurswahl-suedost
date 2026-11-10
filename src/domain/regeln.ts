import { FAECHER, fach, oderListe } from './faecher'
import {
  ALLE,
  AUFGABENFELD_LABEL,
  SCHRIFTLICH,
  SLOTS,
  type Aufgabenfeld,
  type Fach,
  type Kategorie,
  type Wahl,
} from './types'

export interface Regel {
  id: string
  titel: string
  beschreibung: string
  /** Liefert eine Meldung pro Verstoß; leer, wenn die Regel erfüllt ist. */
  pruefe: (wahl: Wahl) => string[]
}

export interface Verstoss {
  regel: Regel
  meldung: string
}

/** Alle gewählten Fächer in Slots der angegebenen Kursarten. */
const faecherIn = (wahl: Wahl, kategorien: readonly Kategorie[]): Fach[] =>
  SLOTS.filter((s) => kategorien.includes(s.kategorie))
    .map((s) => wahl[s.id])
    .filter((id) => id !== null)
    .map(fach)

const enthaelt = (faecher: Fach[], id: string) => faecher.some((f) => f.id === id)

const aufzaehlung = (bedingung: (f: Fach) => boolean | undefined) =>
  oderListe(FAECHER.filter(bedingung).map((f) => f.name))

const GESELLSCHAFTSWISSENSCHAFTEN = aufzaehlung((f) => f.gesellschaftswissenschaft)
const NATURWISSENSCHAFTEN = aufzaehlung((f) => f.naturwissenschaft)

export const REGELN: Regel[] = [
  {
    id: 'eindeutig',
    titel: 'Jedes Fach nur einmal',
    beschreibung: 'Ein Fach kann nur in einem einzigen Kurs belegt werden.',
    pruefe: (wahl) => {
      const alle = faecherIn(wahl, ALLE)
      const doppelt = new Set(alle.filter((f, i) => alle.indexOf(f) !== i))
      return [...doppelt].map((f) => `${f.name} ist mehrfach gewählt.`)
    },
  },
  {
    id: 'pflichtfaecher',
    titel: 'Pflichtfächer unter allen Kursen',
    beschreibung:
      'Unter allen Kursen (LK, GK, mGK und AK) müssen Deutsch, Geografie oder ein anderes gesellschaftswissenschaftliches Fach, Mathematik, eine Naturwissenschaft und zwei Fremdsprachen sein.',
    pruefe: (wahl) => {
      const k = faecherIn(wahl, ALLE)
      const fehler: string[] = []
      if (!enthaelt(k, 'deutsch')) fehler.push('Deutsch fehlt.')
      if (!k.some((f) => f.gesellschaftswissenschaft))
        fehler.push(`Es fehlt ein gesellschaftswissenschaftliches Fach (${GESELLSCHAFTSWISSENSCHAFTEN}).`)
      if (!enthaelt(k, 'mathe')) fehler.push('Mathematik fehlt.')
      if (!k.some((f) => f.naturwissenschaft)) fehler.push(`Es fehlt eine Naturwissenschaft (${NATURWISSENSCHAFTEN}).`)
      const sprachen = k.filter((f) => f.fremdsprache).length
      if (sprachen < 2) fehler.push(`Es werden zwei Fremdsprachen benötigt (gewählt: ${sprachen}).`)
      return fehler
    },
  },
  {
    id: 'aufgabenfelder',
    titel: 'Alle Aufgabenfelder schriftlich',
    beschreibung: 'Aus jedem Aufgabenfeld (I, II, III) muss mindestens ein schriftliches Prüfungsfach (LK oder GK) kommen.',
    pruefe: (wahl) => {
      const felder = new Set(faecherIn(wahl, SCHRIFTLICH).map((f) => f.aufgabenfeld))
      return ([1, 2, 3] as Aufgabenfeld[])
        .filter((a) => !felder.has(a))
        .map((a) => `Kein schriftliches Prüfungsfach aus Aufgabenfeld ${AUFGABENFELD_LABEL[a]}.`)
    },
  },
  {
    id: 'schriftlich-kern',
    titel: 'Mathematik und Deutsch/Fremdsprache schriftlich',
    beschreibung: 'Unter den schriftlichen Prüfungsfächern müssen Mathematik und Deutsch oder eine Fremdsprache sein.',
    pruefe: (wahl) => {
      const s = faecherIn(wahl, SCHRIFTLICH)
      const fehler: string[] = []
      if (!enthaelt(s, 'mathe')) fehler.push('Mathematik muss schriftlich (LK oder GK) geprüft werden.')
      if (!s.some((f) => f.id === 'deutsch' || f.fremdsprache))
        fehler.push('Deutsch oder eine Fremdsprache muss schriftlich (LK oder GK) geprüft werden.')
      return fehler
    },
  },
  {
    id: 'leistungsfaecher',
    titel: 'Kernfach als Leistungskurs',
    beschreibung: 'Eines der Leistungsfächer muss Deutsch, Mathematik oder eine Fremdsprache sein.',
    pruefe: (wahl) => {
      const lks = faecherIn(wahl, ['lk'])
      const ok = lks.some((f) => f.id === 'deutsch' || f.id === 'mathe' || f.fremdsprache)
      return ok ? [] : ['Mindestens ein LK muss Deutsch, Mathematik oder eine Fremdsprache sein.']
    },
  },
]

export function pruefeWahl(wahl: Wahl): Verstoss[] {
  return REGELN.flatMap((regel) => regel.pruefe(wahl).map((meldung) => ({ regel, meldung })))
}
