import { FAECHER, sortiert } from './faecher'
import { pruefeWahl } from './regeln'
import { KATEGORIEN, SLOTS, leereWahl, type Kategorie, type Slot, type SlotId, type Wahl } from './types'

/** Fach-IDs, die in der Kursart des Slots angeboten werden. */
export const angebotFuer = (slot: Slot): string[] =>
  FAECHER.filter((f) => f.angebot.includes(slot.kategorie)).map((f) => f.id)

let cache: Wahl[] | null = null

/**
 * Alle vollständigen, regelkonformen Wahlen. Der Suchraum ist klein genug
 * (wenige Fächer pro Slot), um ihn einmalig komplett aufzuzählen.
 */
export function alleGueltigenWahlen(): Wahl[] {
  if (cache) return cache
  const ergebnis: Wahl[] = []
  const aktuell = leereWahl()
  const belegt = new Set<string>()

  const belege = (i: number) => {
    if (i === SLOTS.length) {
      if (pruefeWahl(aktuell).length === 0) ergebnis.push({ ...aktuell })
      return
    }
    const slot = SLOTS[i]
    for (const id of angebotFuer(slot)) {
      if (belegt.has(id)) continue
      aktuell[slot.id] = id
      belegt.add(id)
      belege(i + 1)
      belegt.delete(id)
    }
    aktuell[slot.id] = null
  }

  belege(0)
  cache = ergebnis
  return ergebnis
}

/**
 * Für jeden Slot die Fächer, mit denen sich die übrigen bereits getroffenen
 * Entscheidungen noch zu einer gültigen Gesamtwahl ergänzen lassen. Der eigene
 * Wert eines Slots wird dabei ignoriert, damit er sich jederzeit ändern lässt.
 */
export function moeglicheFaecher(wahl: Wahl, gueltig = alleGueltigenWahlen()): Record<SlotId, Set<string>> {
  const moeglich = Object.fromEntries(SLOTS.map((s) => [s.id, new Set<string>()])) as Record<SlotId, Set<string>>
  const gesetzt = SLOTS.filter((s) => wahl[s.id] !== null)

  for (const kandidat of gueltig) {
    // Weicht der Kandidat in genau einem gesetzten Slot ab, ist er nur für diesen Slot eine Alternative.
    let abweichung: SlotId | null = null
    let zuViele = false
    for (const s of gesetzt) {
      if (kandidat[s.id] === wahl[s.id]) continue
      if (abweichung) {
        zuViele = true
        break
      }
      abweichung = s.id
    }
    if (zuViele) continue
    if (abweichung) moeglich[abweichung].add(kandidat[abweichung]!)
    else for (const s of SLOTS) moeglich[s.id].add(kandidat[s.id]!)
  }
  return moeglich
}

function* kombinationen<T>(liste: T[], groesse: number, ab = 0): Generator<T[]> {
  if (groesse === 0) {
    yield []
    return
  }
  for (let i = ab; i <= liste.length - groesse; i++)
    for (const rest of kombinationen(liste, groesse - 1, i + 1)) yield [liste[i], ...rest]
}

/**
 * Kleinste Fächergruppe S, von der jede Kandidatenwahl in Slot a oder b
 * mindestens ein Fach enthält. Bei Gleichstand gewinnt die Reihenfolge im Kursangebot.
 */
export function kleinsteGruppe(kandidaten: Wahl[], a: SlotId, b: SlotId): Set<string> {
  const paare = [...new Map(kandidaten.map((v) => [[v[a], v[b]].sort().join('|'), [v[a]!, v[b]!]])).values()]
  const faecher = sortiert(paare.flat())
  for (let groesse = 1; groesse < faecher.length; groesse++) {
    for (const gruppe of kombinationen(faecher, groesse)) {
      if (paare.every(([x, y]) => gruppe.includes(x) || gruppe.includes(y))) return new Set(gruppe)
    }
  }
  return new Set(faecher)
}

let pflichtCache: { kategorie: Kategorie; fach: string }[] | null = null

/** Fächer, die unabhängig von jeder Auswahl in einer bestimmten Kursart belegt werden müssen. */
export function statischePflichtfaecher() {
  if (pflichtCache) return pflichtCache
  const gueltig = alleGueltigenWahlen()
  pflichtCache = KATEGORIEN.flatMap((k) => {
    const slots = SLOTS.filter((s) => s.kategorie === k.id)
    return FAECHER.filter(
      (f) => gueltig.length > 0 && gueltig.every((v) => slots.some((s) => v[s.id] === f.id)),
    ).map((f) => ({ kategorie: k.id, fach: f.id }))
  })
  return pflichtCache
}

/** Trägt statische Pflichtfächer in den ersten freien Slot ihrer Kursart ein. */
export function ergaenzePflicht(wahl: Wahl): Wahl {
  const neu = { ...wahl }
  for (const { kategorie, fach } of statischePflichtfaecher()) {
    if (Object.values(neu).includes(fach)) continue
    const frei = SLOTS.find((s) => s.kategorie === kategorie && neu[s.id] === null)
    if (frei) neu[frei.id] = fach
  }
  return neu
}

/** Lässt sich die (Teil-)Wahl noch regelkonform vervollständigen? */
export const istVervollstaendigbar = (wahl: Wahl, gueltig = alleGueltigenWahlen()) =>
  gueltig.some((k) => SLOTS.every((s) => wahl[s.id] === null || k[s.id] === wahl[s.id]))
