import { describe, expect, it } from 'vitest'
import { verteileErzwungenePaare, type Optionen } from './anzeige'
import { angebotFuer, moeglicheFaecher } from './domain/solver'
import { SLOTS, leereWahl, type Wahl } from './domain/types'

const optionenFuer = (wahl: Wahl) => {
  const m = moeglicheFaecher(wahl)
  return Object.fromEntries(SLOTS.map((s) => [s.id, angebotFuer(s).filter((id) => m[s.id].has(id))])) as Optionen
}

const wahlMitFesterMgk: Wahl = { ...leereWahl(), lk1: 'mathe', lk2: 'chemie', gk1: 'deutsch', gk2: 'geografie' }

describe('verteileErzwungenePaare', () => {
  it('verteilt zwei verbleibende Fächer auf die beiden Slots', () => {
    const o = verteileErzwungenePaare(wahlMitFesterMgk, optionenFuer(wahlMitFesterMgk))
    expect(o.mgk1).toEqual(['englisch'])
    expect(o.mgk2).toEqual(['russisch'])
  })

  it('lässt ein bereits gewähltes Fach in seinem Slot', () => {
    const wahl: Wahl = { ...wahlMitFesterMgk, mgk2: 'englisch' }
    const o = verteileErzwungenePaare(wahl, optionenFuer(wahl))
    expect(o.mgk1).toEqual(['russisch'])
    expect(o.mgk2).toEqual(['englisch'])
  })

  it('ändert nichts, solange es echte Alternativen gibt', () => {
    const wahl = leereWahl()
    const optionen = optionenFuer(wahl)
    expect(verteileErzwungenePaare(wahl, optionen)).toEqual(optionen)
  })
})
