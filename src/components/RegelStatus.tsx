import { REGELN, pruefeWahl } from '../domain/regeln'
import { SLOTS, istVollstaendig, type Wahl } from '../domain/types'
import type { Modus } from '../zustand'

interface Props {
  wahl: Wahl
  modus: Modus
}

export function RegelStatus({ wahl, modus }: Props) {
  const vollstaendig = istVollstaendig(wahl)
  const verstoesse = vollstaendig ? pruefeWahl(wahl) : []
  const offen = SLOTS.filter((s) => wahl[s.id] === null).length

  let zustand: 'ok' | 'fehler' | 'offen' = 'offen'
  let titel = `Noch ${offen} von ${SLOTS.length} Kursen offen`
  let text =
    modus === 'gefuehrt'
      ? 'Jede angezeigte Option lässt sich noch zu einer regelkonformen Wahl ergänzen.'
      : 'Sobald alle Kurse belegt sind, wird deine Wahl gegen die Regeln geprüft.'

  if (vollstaendig && verstoesse.length === 0) {
    zustand = 'ok'
    titel = 'Deine Wahl erfüllt alle Regeln'
    text = 'Alle Kurse sind belegt und regelkonform.'
  } else if (vollstaendig) {
    const anzahl = new Set(verstoesse.map((v) => v.regel.id)).size
    zustand = 'fehler'
    titel = anzahl === 1 ? 'Deine Wahl verletzt 1 Regel' : `Deine Wahl verletzt ${anzahl} Regeln`
    text = 'Die betroffenen Regeln sind unten markiert.'
  }

  return (
    <section className={`status status-${zustand}`} aria-live="polite">
      <div className="status-kopf">
        <span className="status-icon" aria-hidden="true">
          {zustand === 'ok' ? '✓' : zustand === 'fehler' ? '!' : offen}
        </span>
        <div>
          <h2>{titel}</h2>
          <p>{text}</p>
        </div>
      </div>

      <ul className="regeln">
        {REGELN.map((regel) => {
          const meldungen = verstoesse.filter((v) => v.regel === regel).map((v) => v.meldung)
          const klasse = !vollstaendig ? 'neutral' : meldungen.length ? 'verletzt' : 'erfuellt'
          return (
            <li key={regel.id} className={`regel regel-${klasse}`}>
              <span className="regel-icon" aria-hidden="true">
                {klasse === 'erfuellt' ? '✓' : klasse === 'verletzt' ? '✕' : '•'}
              </span>
              <div>
                <strong>{regel.titel}</strong>
                <span className="regel-text">{regel.beschreibung}</span>
                {meldungen.length > 0 && (
                  <ul className="meldungen">
                    {meldungen.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
