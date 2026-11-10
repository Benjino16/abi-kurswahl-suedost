import { describe, expect, it } from 'vitest'
import { pruefeWahl } from './regeln'
import { alleGueltigenWahlen, istVervollstaendigbar, moeglicheFaecher } from './solver'
import { leereWahl, type Wahl } from './types'

const gueltig: Wahl = {
  lk1: 'mathe',
  lk2: 'deutsch',
  gk1: 'geografie',
  gk2: 'chemie',
  mgk1: 'englisch',
  mgk2: 'russisch',
  ak1: 'politik',
  ak2: 'biologie',
}

const regelIds = (wahl: Wahl) => [...new Set(pruefeWahl(wahl).map((v) => v.regel.id))]

describe('pruefeWahl', () => {
  it('akzeptiert eine regelkonforme Wahl', () => {
    expect(pruefeWahl(gueltig)).toEqual([])
  })

  it('erkennt doppelt gewählte Fächer', () => {
    expect(regelIds({ ...gueltig, ak2: 'chemie' })).toContain('eindeutig')
  })

  it('verlangt zwei Fremdsprachen unter den Prüfungsfächern', () => {
    expect(regelIds({ ...gueltig, mgk2: 'politik', ak1: 'ds' })).toEqual(['pflichtfaecher'])
  })

  it('verlangt alle Aufgabenfelder schriftlich', () => {
    expect(regelIds({ ...gueltig, gk1: 'englisch', mgk1: 'geografie' })).toEqual(['aufgabenfelder'])
  })

  it('verlangt Deutsch, Mathe oder Fremdsprache als LK', () => {
    expect(regelIds({ ...gueltig, lk1: 'biologie', lk2: 'chemie', gk2: 'mathe', mgk1: 'deutsch', ak2: 'ds', gk1: 'geografie', mgk2: 'russisch', ak1: 'politik' })).toContain(
      'leistungsfaecher',
    )
  })
})

describe('solver', () => {
  it('findet gültige Wahlen, die alle die Regeln erfüllen', () => {
    const alle = alleGueltigenWahlen()
    expect(alle.length).toBeGreaterThan(0)
    expect(alle.every((w) => pruefeWahl(w).length === 0)).toBe(true)
  })

  it('bietet Russisch nur im mündlichen GK an', () => {
    const m = moeglicheFaecher(leereWahl())
    expect(m.mgk1.has('russisch')).toBe(true)
    expect(m.lk1.has('russisch')).toBe(false)
  })

  it('erzwingt nach Biologie-LK ein Kernfach als zweiten LK', () => {
    const m = moeglicheFaecher({ ...leereWahl(), lk1: 'biologie' })
    expect([...m.lk2].sort()).toEqual(['deutsch', 'englisch', 'mathe'])
  })

  it('erlaubt im eigenen Slot weiterhin Alternativen', () => {
    const m = moeglicheFaecher({ ...leereWahl(), lk1: 'biologie' })
    expect(m.lk1.size).toBeGreaterThan(1)
  })

  it('lässt nach Englisch im mGK nur noch Russisch als zweiten mGK zu', () => {
    const m = moeglicheFaecher({ ...leereWahl(), mgk1: 'englisch' })
    expect([...m.mgk2]).toEqual(['russisch'])
  })

  it('erkennt nicht mehr vervollständigbare Teilwahlen', () => {
    expect(istVervollstaendigbar({ ...leereWahl(), mgk1: 'politik', mgk2: 'geografie' })).toBe(false)
    expect(istVervollstaendigbar({ ...leereWahl(), lk1: 'mathe' })).toBe(true)
  })
})
