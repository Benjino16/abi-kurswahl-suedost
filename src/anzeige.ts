import { fach, oderListe, sortiert } from './domain/faecher'
import {
  alleGueltigenWahlen,
  angebotFuer,
  kleinsteGruppe,
  moeglicheFaecher,
  statischePflichtfaecher,
} from './domain/solver'
import { KATEGORIEN, SLOTS, type SlotId, type Wahl } from './domain/types'

export interface SlotAnzeige {
  optionen: string[]
  info?: string
  gesperrt?: boolean
}

export type Anzeige = Record<SlotId, SlotAnzeige>

/** Freie Wahl: jeder Slot zeigt das komplette Angebot seiner Kursart. */
export const freieAnzeige = (): Anzeige =>
  Object.fromEntries(SLOTS.map((s) => [s.id, { optionen: angebotFuer(s) }])) as Anzeige

/**
 * Geführte Wahl: nur Fächer, die sich noch regelkonform ergänzen lassen. Zusätzlich
 * zeigt in jeder Kursart ein Slot nur die kleinste Fächergruppe, aus der in jeder
 * gültigen Wahl mindestens ein Fach in dieser Kursart vorkommt. Begrenzt wird der
 * Slot, der ein Fach dieser Gruppe trägt bzw. tragen muss – sonst der obere.
 */
export function gefuehrteAnzeige(wahl: Wahl): Anzeige {
  const gueltig = alleGueltigenWahlen()
  const moeglich = moeglicheFaecher(wahl, gueltig)
  const optionen = Object.fromEntries(SLOTS.map((s) => [s.id, sortiert(moeglich[s.id])])) as Record<SlotId, string[]>
  const gruppenInfo: Partial<Record<SlotId, string>> = {}

  for (const k of KATEGORIEN) {
    const ids = SLOTS.filter((s) => s.kategorie === k.id).map((s) => s.id)
    if (ids.length !== 2) continue
    const [oben, unten] = ids
    const a = wahl[oben]
    const b = wahl[unten]
    if (a !== null && b !== null) continue

    // Gültige Wahlen, die außerhalb dieser Kursart zur aktuellen Auswahl passen.
    const kandidaten = gueltig.filter((v) =>
      SLOTS.every((s) => ids.includes(s.id) || wahl[s.id] === null || v[s.id] === wahl[s.id]),
    )
    if (kandidaten.length === 0) continue
    const gruppe = kleinsteGruppe(kandidaten, oben, unten, a ?? b)

    const begrenzt = a !== null ? (gruppe.has(a) ? oben : unten) : b !== null ? (gruppe.has(b) ? unten : oben) : oben
    const anderer = begrenzt === oben ? unten : oben

    const vorher = optionen[begrenzt]
    optionen[begrenzt] = vorher.filter((id) => gruppe.has(id))
    // Ist der begrenzte Slot noch frei, zeigt der andere nur Fächer, die zu einem Gruppenfach passen –
    // sonst erscheinen dort Tausch-Alternativen, die die Gruppe in diesen Slot verschieben würden.
    if (wahl[begrenzt] === null) {
      optionen[anderer] = sortiert(kandidaten.filter((v) => gruppe.has(v[begrenzt]!)).map((v) => v[anderer]!))
    }
    if (optionen[begrenzt].length > 1 && optionen[begrenzt].length < vorher.length) {
      const namen = oderListe(sortiert(gruppe).map((id) => fach(id).name))
      gruppenInfo[begrenzt] =
        `In dieser Kursart muss mindestens eines dieser Fächer belegt werden: ${namen}. ` +
        'Deshalb stehen hier nur diese zur Auswahl – das zweite Fach wählst du im anderen Slot.'
    }
  }

  const gesperrt = new Set(
    statischePflichtfaecher().flatMap(({ kategorie, fach: id }) =>
      SLOTS.filter((s) => s.kategorie === kategorie && wahl[s.id] === id).map((s) => s.id),
    ),
  )

  return Object.fromEntries(
    SLOTS.map((s) => {
      const o = optionen[s.id]
      if (gesperrt.has(s.id)) {
        const name = fach(wahl[s.id]!).name
        return [
          s.id,
          {
            optionen: [wahl[s.id]!],
            gesperrt: true,
            info: `${name} muss in jeder gültigen Wahl in dieser Kursart belegt werden und ist deshalb fest eingetragen.`,
          },
        ]
      }
      if (o.length === 1) {
        return [s.id, { optionen: o, info: `Bei deiner bisherigen Auswahl bleibt hier nur ${fach(o[0]).name}.` }]
      }
      return [s.id, { optionen: o, info: gruppenInfo[s.id] }]
    }),
  ) as Anzeige
}
