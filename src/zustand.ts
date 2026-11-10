import { useEffect, useState } from 'react'
import { angebotFuer } from './domain/solver'
import { SLOTS, leereWahl, type Wahl } from './domain/types'

export type Modus = 'gefuehrt' | 'frei'

export interface Zustand {
  modus: Modus
  wahl: Wahl
}

const SCHLUESSEL = 'kurswahl:v1'

function lade(): Zustand {
  const wahl = leereWahl()
  try {
    const roh = JSON.parse(localStorage.getItem(SCHLUESSEL) ?? 'null') as {
      modus?: unknown
      wahl?: Record<string, unknown>
    } | null
    // Nur Einträge übernehmen, die zum aktuellen Kursangebot passen.
    for (const s of SLOTS) {
      const id = roh?.wahl?.[s.id]
      if (typeof id === 'string' && angebotFuer(s).includes(id)) wahl[s.id] = id
    }
    return { modus: roh?.modus === 'frei' ? 'frei' : 'gefuehrt', wahl }
  } catch {
    return { modus: 'gefuehrt', wahl }
  }
}

/** Modus und Wahl, im Browser des Nutzers gespeichert. */
export function useGespeicherterZustand() {
  const [zustand, setZustand] = useState(lade)
  useEffect(() => {
    try {
      localStorage.setItem(SCHLUESSEL, JSON.stringify(zustand))
    } catch {
      // Speichern ist nur Komfort; ohne Storage funktioniert die App trotzdem.
    }
  }, [zustand])
  return [zustand, setZustand] as const
}
