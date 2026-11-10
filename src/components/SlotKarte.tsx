import { useState } from 'react'
import type { SlotAnzeige } from '../anzeige'
import { fach } from '../domain/faecher'
import { AUFGABENFELD_LABEL, type Slot } from '../domain/types'

interface Props {
  slot: Slot
  gewaehlt: string | null
  anzeige: SlotAnzeige
  onWaehle: (id: string | null) => void
}

export function SlotKarte({ slot, gewaehlt, anzeige, onWaehle }: Props) {
  const { optionen, info, gesperrt } = anzeige
  // Das gewählte Fach bleibt sichtbar, auch wenn es nicht mehr zu den Optionen passt.
  const sichtbar = gewaehlt && !optionen.includes(gewaehlt) ? [gewaehlt, ...optionen] : optionen
  const titelId = `slot-${slot.id}`
  const infoId = `info-${slot.id}`
  // Antippen öffnet den Hinweis auch auf Touch-Geräten ohne Hover.
  const [infoOffen, setInfoOffen] = useState(false)

  return (
    <div className={gewaehlt ? 'slot belegt' : 'slot'} role="group" aria-labelledby={titelId}>
      <div className="slot-kopf">
        <span id={titelId} className="slot-label">
          {slot.label}
        </span>
        <span className="slot-status">
          {gewaehlt ? (
            <span className="slot-wert">{fach(gewaehlt).name}</span>
          ) : sichtbar.length === 1 ? (
            <span className="slot-wert einzig">einzige Option</span>
          ) : (
            <span className="slot-wert">offen</span>
          )}
          {info && (
            <button
              type="button"
              className={infoOffen ? 'info offen' : 'info'}
              aria-label="Hinweis"
              aria-describedby={infoId}
              aria-expanded={infoOffen}
              onClick={() => setInfoOffen((o) => !o)}
              onBlur={() => setInfoOffen(false)}
            >
              i
              <span id={infoId} role="tooltip" className="tooltip">
                {info}
              </span>
            </button>
          )}
        </span>
      </div>
      {sichtbar.length === 0 ? (
        <p className="slot-leer">Keine passende Option.</p>
      ) : (
        <div className="chips">
          {sichtbar.map((id) => {
            const f = fach(id)
            const aktiv = id === gewaehlt
            return (
              <button
                key={id}
                type="button"
                className="chip"
                aria-pressed={aktiv}
                disabled={gesperrt && aktiv}
                onClick={() => onWaehle(aktiv ? null : id)}
              >
                {gesperrt && aktiv && <SchlossIcon />}
                {f.name}
                <span className="feld" title={`Aufgabenfeld ${AUFGABENFELD_LABEL[f.aufgabenfeld]}`}>
                  {AUFGABENFELD_LABEL[f.aufgabenfeld]}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SchlossIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-label="gesperrt" role="img">
      <path d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7H4a1.5 1.5 0 0 0-1.5 1.5v5A1.5 1.5 0 0 0 4 15h8a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 12 7h-.5V4.5A3.5 3.5 0 0 0 8 1Zm2 6H6V4.5a2 2 0 1 1 4 0V7Z" />
    </svg>
  )
}
