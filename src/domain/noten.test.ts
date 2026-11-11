import { describe, expect, it } from 'vitest'
import { MAX_GESAMT, abiturnote, gewertet, notenstufe, pruefeNoten } from './noten'
import type { SlotId } from './types'

const alle = (p: number): Record<SlotId, number> => ({
  lk1: p,
  lk2: p,
  gk1: p,
  gk2: p,
  mgk1: p,
  mgk2: p,
  ak1: p,
  ak2: p,
})

const regelIds = (punkte: Record<SlotId, number>) => [...new Set(pruefeNoten(punkte).map((v) => v.regel.id))]

describe('Notenrechnung', () => {
  it('ordnet Punkte den Notenstufen zu', () => {
    expect(notenstufe(15)).toBe('1+')
    expect(notenstufe(11)).toBe('2')
    expect(notenstufe(7)).toBe('3-')
    expect(notenstufe(0)).toBe('6')
  })

  it('gewichtet LK ×13, GK ×9, mGK und AK ×4', () => {
    expect(gewertet(alle(1))).toBe(2 * 13 + 2 * 9 + 2 * 4 + 2 * 4)
    expect(MAX_GESAMT).toBe(900)
  })

  it('rechnet Punkte in die Abiturnote um und schneidet nach der ersten Nachkommastelle ab', () => {
    expect(abiturnote(300)).toBe(4)
    expect(abiturnote(301)).toBe(3.9)
    expect(abiturnote(822)).toBe(1.1)
    expect(abiturnote(823)).toBe(1)
    expect(abiturnote(900)).toBe(1)
  })
})

describe('pruefeNoten', () => {
  it('lässt durchgehend 5 Punkte bestehen', () => {
    expect(pruefeNoten(alle(5))).toEqual([])
  })

  it('verbietet 0 Punkte in einem Kurs', () => {
    expect(regelIds({ ...alle(10), ak2: 0 })).toEqual(['keine-null'])
  })

  it('verlangt einen LK mit mindestens 5 Punkten', () => {
    expect(regelIds({ ...alle(15), lk1: 4, lk2: 3 })).toEqual(['schriftlich-fuenf'])
  })

  it('verlangt zwei schriftliche Kurse mit mindestens 5 Punkten', () => {
    expect(regelIds({ ...alle(15), lk2: 4, gk1: 4, gk2: 4 })).toEqual(['schriftlich-fuenf'])
  })

  it('verlangt zwei mündliche Kurse mit mindestens 5 Punkten', () => {
    expect(regelIds({ ...alle(15), mgk1: 4, mgk2: 4, ak1: 4 })).toEqual(['muendlich-fuenf'])
  })

  it('prüft die Mindestsummen schriftlich und mündlich', () => {
    expect(regelIds({ ...alle(5), gk1: 4 })).toEqual(['schriftlich-summe'])
    expect(regelIds({ ...alle(5), ak1: 4 })).toEqual(['muendlich-summe'])
  })
})
