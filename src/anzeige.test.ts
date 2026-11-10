import { describe, expect, it } from 'vitest'
import { gefuehrteAnzeige } from './anzeige'
import { ergaenzePflicht, statischePflichtfaecher } from './domain/solver'
import { leereWahl, type Wahl } from './domain/types'

const start = () => ergaenzePflicht(leereWahl())
const optionen = (wahl: Wahl) => {
  const a = gefuehrteAnzeige(wahl)
  return (slot: keyof Wahl) => a[slot].optionen
}

describe('statische Pflicht', () => {
  it('erkennt Russisch als festes mGK-Fach', () => {
    expect(statischePflichtfaecher()).toEqual([{ kategorie: 'mgk', fach: 'russisch' }])
  })

  it('trägt Russisch in den oberen mGK ein und sperrt ihn', () => {
    const wahl = start()
    expect(wahl.mgk1).toBe('russisch')
    const a = gefuehrteAnzeige(wahl)
    expect(a.mgk1).toMatchObject({ optionen: ['russisch'], gesperrt: true })
    expect(a.mgk2.optionen).not.toContain('russisch')
  })

  it('belässt Russisch im unteren mGK, wenn es dort schon steht', () => {
    expect(ergaenzePflicht({ ...leereWahl(), mgk2: 'russisch' }).mgk1).toBeNull()
  })
})

describe('gefuehrteAnzeige', () => {
  it('begrenzt den oberen LK auf die Pflichtgruppe, der untere zeigt alles', () => {
    const o = optionen(start())
    expect(o('lk1')).toEqual(['deutsch', 'englisch', 'mathe'])
    expect(o('lk2')).toEqual(['deutsch', 'englisch', 'kunst', 'mathe', 'biologie', 'chemie'])
    expect(gefuehrteAnzeige(start()).lk1.info).toMatch(/Deutsch, Englisch oder Mathematik/)
  })

  it('macht den unteren Slot zum begrenzten, wenn dort ein Gruppenfach gewählt wird', () => {
    const o = optionen({ ...start(), lk2: 'deutsch' })
    expect(o('lk2')).toEqual(['deutsch', 'englisch', 'mathe'])
    expect(o('lk1')).toContain('kunst')
  })

  it('begrenzt den oberen Slot, wenn unten ein Fach außerhalb der Gruppe steht', () => {
    expect(optionen({ ...start(), lk2: 'kunst' })('lk1')).toEqual(['deutsch', 'englisch', 'mathe'])
  })

  it('hebt die Begrenzung auf, wenn beide Slots belegt sind', () => {
    expect(optionen({ ...start(), lk1: 'deutsch', lk2: 'mathe' })('lk1')).toContain('kunst')
  })

  it('verteilt zwei erzwungene Fächer auf beide Slots', () => {
    const wahl: Wahl = { ...start(), gk1: 'deutsch', gk2: 'geografie', mgk2: 'chemie' }
    const o = optionen(wahl)
    expect(o('lk1')).toEqual(['englisch'])
    expect(o('lk2')).toEqual(['mathe'])
  })
})
