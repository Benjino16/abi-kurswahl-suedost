import { fach } from '../domain/faecher'
import { AUFGABENFELD_LABEL, type Slot } from '../domain/types'

interface Props {
  slot: Slot
  gewaehlt: string | null
  optionen: string[]
  onWaehle: (id: string | null) => void
}

export function SlotKarte({ slot, gewaehlt, optionen, onWaehle }: Props) {
  // Das gewählte Fach bleibt sichtbar, auch wenn es nicht mehr zu den Optionen passt.
  const sichtbar = gewaehlt && !optionen.includes(gewaehlt) ? [gewaehlt, ...optionen] : optionen
  const titelId = `slot-${slot.id}`

  return (
    <div className={gewaehlt ? 'slot belegt' : 'slot'} role="group" aria-labelledby={titelId}>
      <div className="slot-kopf">
        <span id={titelId} className="slot-label">
          {slot.label}
        </span>
        {gewaehlt ? (
          <span className="slot-wert">{fach(gewaehlt).name}</span>
        ) : sichtbar.length === 1 ? (
          <span className="slot-wert einzig">einzige Option</span>
        ) : (
          <span className="slot-wert">offen</span>
        )}
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
                onClick={() => onWaehle(aktiv ? null : id)}
              >
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
