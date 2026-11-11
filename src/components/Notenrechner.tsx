import { fach } from '../domain/faecher'
import {
  GEWICHT,
  MAX_GESAMT,
  MAX_PUNKTE,
  MIN_MUENDLICH,
  MIN_SCHRIFTLICH,
  NOTEN_REGELN,
  abiturnote,
  notenstufe,
  pruefeNoten,
  vollstaendigePunkte,
  type Punkte,
} from '../domain/noten'
import { SCHRIFTLICH, SLOTS, type Kategorie, type Slot, type SlotId, type Wahl } from '../domain/types'
import type { Skala } from '../zustand'
import { RegelListe } from './RegelStatus'

const KURSART: Record<Kategorie, string> = { lk: 'LK', gk: 'GK', mgk: 'mGK', ak: 'AK' }

const GRUPPEN = [
  { titel: 'Schriftlich', slots: SLOTS.filter((s) => SCHRIFTLICH.includes(s.kategorie)), minimum: MIN_SCHRIFTLICH },
  { titel: 'Mündlich', slots: SLOTS.filter((s) => !SCHRIFTLICH.includes(s.kategorie)), minimum: MIN_MUENDLICH },
]

/** Startposition des Reglers, solange noch keine Note eingetragen ist. */
const MITTE = 8

const komma = (n: number) => n.toFixed(1).replace('.', ',')

interface Props {
  wahl: Wahl
  punkte: Punkte
  skala: Skala
  onPunkte: (slot: SlotId, punkte: number) => void
  onSkala: (skala: Skala) => void
}

export function Notenrechner({ wahl, punkte, skala, onPunkte, onSkala }: Props) {
  const anzeigen = (p: number) => (skala === 'noten' ? notenstufe(p) : `${p} P.`)
  const summe = (slots: Slot[]) => slots.reduce((s, slot) => s + (punkte[slot.id] ?? 0) * GEWICHT[slot.kategorie], 0)

  return (
    <>
      <div className="skala">
        <span>Eingabe als</span>
        <div className="modus" role="group" aria-label="Skala">
          <button type="button" aria-pressed={skala === 'noten'} onClick={() => onSkala('noten')}>
            Noten
          </button>
          <button type="button" aria-pressed={skala === 'punkte'} onClick={() => onSkala('punkte')}>
            Punkte
          </button>
        </div>
      </div>

      <div className="rechner">
        {GRUPPEN.map((g) => (
          <section key={g.titel} className="rechner-gruppe">
            <div className="rechner-kopf">
              <h2>{g.titel}</h2>
              <span className={summe(g.slots) >= g.minimum ? 'rechner-summe erreicht' : 'rechner-summe'}>
                {summe(g.slots)} / mind. {g.minimum} Punkte
              </span>
            </div>
            {g.slots.map((slot) => (
              <KursZeile
                key={slot.id}
                slot={slot}
                fachId={wahl[slot.id]}
                punkte={punkte[slot.id]}
                anzeigen={anzeigen}
                skala={skala}
                onPunkte={(p) => onPunkte(slot.id, p)}
              />
            ))}
          </section>
        ))}
      </div>

      <Ergebnis punkte={punkte} gesamt={summe(SLOTS)} />
    </>
  )
}

interface ZeileProps {
  slot: Slot
  fachId: string | null
  punkte: number | null
  skala: Skala
  anzeigen: (p: number) => string
  onPunkte: (p: number) => void
}

function KursZeile({ slot, fachId, punkte, skala, anzeigen, onPunkte }: ZeileProps) {
  const id = `note-${slot.id}`
  const gewicht = GEWICHT[slot.kategorie]
  return (
    <div className={punkte === null ? 'kurs leer' : 'kurs'}>
      <label htmlFor={id} className="kurs-name">
        {fachId ? (
          <>
            {fach(fachId).name} <span className="kurs-art">{KURSART[slot.kategorie]}</span>
          </>
        ) : (
          slot.label
        )}
      </label>
      <span className="kurs-wert">{punkte === null ? '–' : anzeigen(punkte)}</span>
      <input
        id={id}
        type="range"
        min={0}
        max={MAX_PUNKTE}
        step={1}
        value={punkte ?? MITTE}
        aria-valuetext={punkte === null ? 'keine Note' : anzeigen(punkte)}
        onChange={(e) => onPunkte(Number(e.currentTarget.value))}
        // Ein Klick genau auf die Startposition löst kein change aus, soll die Note aber trotzdem setzen.
        onPointerUp={(e) => punkte === null && onPunkte(Number(e.currentTarget.value))}
      />
      <span className="kurs-skala" aria-hidden="true">
        <span>{skala === 'noten' ? '6' : '0'}</span>
        <span>{skala === 'noten' ? '1+' : MAX_PUNKTE}</span>
      </span>
      <span className="kurs-gewertet">
        ×{gewicht} = {(punkte ?? 0) * gewicht}
      </span>
    </div>
  )
}

function Ergebnis({ punkte, gesamt }: { punkte: Punkte; gesamt: number }) {
  const vollstaendig = vollstaendigePunkte(punkte)
  const verstoesse = vollstaendig ? pruefeNoten(vollstaendig) : []
  const offen = SLOTS.filter((s) => punkte[s.id] === null).length

  let zustand: 'ok' | 'fehler' | 'offen' = 'offen'
  let titel = `Noch ${offen} von ${SLOTS.length} Kursen ohne Note`
  let text = 'Sobald alle Kurse eine Note haben, werden Abiturnote und Bestehensregeln ausgewertet.'

  if (vollstaendig && verstoesse.length === 0) {
    zustand = 'ok'
    titel = 'Bestanden'
    text = 'Alle Bedingungen zum Bestehen sind erfüllt.'
  } else if (vollstaendig) {
    const anzahl = new Set(verstoesse.map((v) => v.regel.id)).size
    zustand = 'fehler'
    titel = 'Nicht bestanden'
    text = anzahl === 1 ? '1 Bedingung ist nicht erfüllt.' : `${anzahl} Bedingungen sind nicht erfüllt.`
  }

  return (
    <section className={`status status-${zustand}`} aria-live="polite">
      <div className="ergebnis">
        <div>
          <span className="ergebnis-label">Abiturnote</span>
          <span className="ergebnis-wert">{vollstaendig ? komma(abiturnote(gesamt)) : '–'}</span>
        </div>
        <div>
          <span className="ergebnis-label">Gesamtpunkte</span>
          <span className="ergebnis-wert">
            {gesamt}
            <small> / {MAX_GESAMT}</small>
          </span>
        </div>
      </div>

      <div className="status-kopf">
        <span className="status-icon" aria-hidden="true">
          {zustand === 'ok' ? '✓' : zustand === 'fehler' ? '!' : offen}
        </span>
        <div>
          <h2>{titel}</h2>
          <p>{text}</p>
        </div>
      </div>

      <RegelListe regeln={NOTEN_REGELN} verstoesse={verstoesse} geprueft={vollstaendig !== null} />
    </section>
  )
}
