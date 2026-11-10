/** Die vier Kurskategorien der Abiturwahl. */
export type Kategorie = 'leistungskurs' | 'grundkurs' | 'muendlich' | 'anrechnung'

/** Wie viele Kurse pro Kategorie gewählt werden. */
export const ANZAHL_PRO_KATEGORIE: Record<Kategorie, number> = {
  leistungskurs: 2,
  grundkurs: 2,
  muendlich: 2,
  anrechnung: 2,
}

export const KATEGORIE_LABEL: Record<Kategorie, string> = {
  leistungskurs: 'Leistungskurse',
  grundkurs: 'Grundkurse (schriftlich)',
  muendlich: 'Grundkurse (mündlich)',
  anrechnung: 'Anrechnungskurse',
}

export interface Fach {
  id: string
  name: string
}

/** Auswahl: pro Kategorie die gewählten Fach-IDs. */
export type Wahl = Record<Kategorie, string[]>

export const leereWahl = (): Wahl => ({
  leistungskurs: [],
  grundkurs: [],
  muendlich: [],
  anrechnung: [],
})
