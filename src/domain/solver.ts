import { FAECHER } from './faecher'
import { pruefeWahl } from './regeln'
import { SLOTS, leereWahl, type Slot, type SlotId, type Wahl } from './types'

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

/** Lässt sich die (Teil-)Wahl noch regelkonform vervollständigen? */
export const istVervollstaendigbar = (wahl: Wahl, gueltig = alleGueltigenWahlen()) =>
  gueltig.some((k) => SLOTS.every((s) => wahl[s.id] === null || k[s.id] === wahl[s.id]))
