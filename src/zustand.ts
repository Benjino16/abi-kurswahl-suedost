import { useCallback, useEffect, useState } from 'react'
import { angebotFuer, ergaenzePflicht } from './domain/solver'
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

/** In der geführten Wahl sind statische Pflichtfächer immer eingetragen. */
export const normalisiere = (z: Zustand): Zustand =>
  z.modus === 'gefuehrt' ? { ...z, wahl: ergaenzePflicht(z.wahl) } : z

/** Modus und Wahl, im Browser des Nutzers gespeichert. */
export function useGespeicherterZustand() {
  const [zustand, setZustand] = useState(() => normalisiere(lade()))
  useEffect(() => {
    try {
      localStorage.setItem(SCHLUESSEL, JSON.stringify(zustand))
    } catch {
      // Speichern ist nur Komfort; ohne Storage funktioniert die App trotzdem.
    }
  }, [zustand])
  const aendere = useCallback((f: (z: Zustand) => Zustand) => setZustand((z) => normalisiere(f(z))), [])
  return [zustand, aendere] as const
}
