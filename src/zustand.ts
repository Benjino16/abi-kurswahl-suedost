import { useCallback, useEffect, useState } from 'react'
import { MAX_PUNKTE, leerePunkte, type Punkte } from './domain/noten'
import { angebotFuer, ergaenzePflicht } from './domain/solver'
import { SLOTS, leereWahl, type Wahl } from './domain/types'

export type Modus = 'gefuehrt' | 'frei'
export type Ansicht = 'wahl' | 'noten'
export type Skala = 'noten' | 'punkte'

export interface Zustand {
  modus: Modus
  /** Kurswahl oder Notenrechner; der Modus der Kurswahl bleibt beim Wechsel erhalten. */
  ansicht: Ansicht
  wahl: Wahl
  punkte: Punkte
  skala: Skala
}

const SCHLUESSEL = 'kurswahl:v1'

const standard = (): Zustand => ({
  modus: 'gefuehrt',
  ansicht: 'wahl',
  wahl: leereWahl(),
  punkte: leerePunkte(),
  skala: 'noten',
})

function lade(): Zustand {
  const z = standard()
  try {
    const roh = JSON.parse(localStorage.getItem(SCHLUESSEL) ?? 'null') as {
      modus?: unknown
      ansicht?: unknown
      wahl?: Record<string, unknown>
      punkte?: Record<string, unknown>
      skala?: unknown
    } | null
    // Nur Einträge übernehmen, die zum aktuellen Kursangebot bzw. zur Punkteskala passen.
    for (const s of SLOTS) {
      const id = roh?.wahl?.[s.id]
      if (typeof id === 'string' && angebotFuer(s).includes(id)) z.wahl[s.id] = id
      const p = roh?.punkte?.[s.id]
      if (Number.isInteger(p) && (p as number) >= 0 && (p as number) <= MAX_PUNKTE) z.punkte[s.id] = p as number
    }
    if (roh?.modus === 'frei') z.modus = 'frei'
    if (roh?.ansicht === 'noten') z.ansicht = 'noten'
    if (roh?.skala === 'punkte') z.skala = 'punkte'
    return z
  } catch {
    return z
  }
}

/** In der geführten Wahl sind statische Pflichtfächer immer eingetragen. */
export const normalisiere = (z: Zustand): Zustand =>
  z.modus === 'gefuehrt' ? { ...z, wahl: ergaenzePflicht(z.wahl) } : z

/** Modus, Wahl und Noten, im Browser des Nutzers gespeichert. */
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
