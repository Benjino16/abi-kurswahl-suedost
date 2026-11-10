import type { Wahl } from './types'

export interface Verstoss {
  regel: string
  meldung: string
}

/** Prüft eine Wahl gegen die Schulregeln. Regeln folgen, sobald sie feststehen. */
export function pruefeWahl(_wahl: Wahl): Verstoss[] {
  return []
}
