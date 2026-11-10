import { KATEGORIEN, SLOTS, type SlotId, type Wahl } from './domain/types'

export type Optionen = Record<SlotId, string[]>

/**
 * Teilen sich die beiden Slots einer Kursart nur noch genau zwei Fächer, ist die
 * Verteilung erzwungen. Dann zeigt jeder Slot nur eins davon an – bereits
 * gewählte Fächer bleiben in ihrem Slot. Reine Darstellung, nichts wird gesperrt.
 */
export function verteileErzwungenePaare(wahl: Wahl, optionen: Optionen): Optionen {
  const ergebnis = { ...optionen }
  for (const k of KATEGORIEN) {
    const slots = SLOTS.filter((s) => s.kategorie === k.id)
    if (slots.length !== 2) continue
    const [a, b] = slots.map((s) => s.id)
    if (optionen[a].length === 0 || optionen[b].length === 0) continue

    const faecher = [...new Set([...optionen[a], ...optionen[b], wahl[a], wahl[b]])].filter((id) => id !== null)
    if (faecher.length !== 2) continue

    const fuerA = wahl[a] ?? faecher.find((id) => id !== wahl[b])!
    ergebnis[a] = [fuerA]
    ergebnis[b] = [wahl[b] ?? faecher.find((id) => id !== fuerA)!]
  }
  return ergebnis
}
