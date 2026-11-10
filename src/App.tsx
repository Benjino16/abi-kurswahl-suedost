import { useMemo } from 'react'
import { RegelStatus } from './components/RegelStatus'
import { SlotKarte } from './components/SlotKarte'
import { angebotFuer, istVervollstaendigbar, moeglicheFaecher } from './domain/solver'
import { KATEGORIEN, SLOTS, leereWahl, type Slot, type SlotId } from './domain/types'
import { useGespeicherterZustand, type Modus } from './zustand'

const MODI: { id: Modus; label: string; hinweis: string }[] = [
  {
    id: 'gefuehrt',
    label: 'Geführte Wahl',
    hinweis: 'Es werden nur Fächer angezeigt, mit denen sich deine Wahl noch regelkonform vervollständigen lässt.',
  },
  {
    id: 'frei',
    label: 'Freie Wahl',
    hinweis: 'Alle angebotenen Fächer sind wählbar. Sobald alle Kurse belegt sind, wird deine Wahl gegen die Regeln geprüft.',
  },
]

function App() {
  const [{ modus, wahl }, setZustand] = useGespeicherterZustand()

  const moeglich = useMemo(() => (modus === 'gefuehrt' ? moeglicheFaecher(wahl) : null), [modus, wahl])
  const sackgasse = modus === 'gefuehrt' && !istVervollstaendigbar(wahl)

  const optionenFuer = (slot: Slot) => {
    const angebot = angebotFuer(slot)
    return moeglich ? angebot.filter((id) => moeglich[slot.id].has(id)) : angebot
  }

  const waehle = (slot: SlotId, id: string | null) => setZustand((z) => ({ ...z, wahl: { ...z.wahl, [slot]: id } }))
  const setModus = (m: Modus) => setZustand((z) => ({ ...z, modus: m }))
  const zuruecksetzen = () => setZustand((z) => ({ ...z, wahl: leereWahl() }))
  const hatAuswahl = SLOTS.some((s) => wahl[s.id] !== null)

  return (
    <main>
      <header className="kopf">
        <h1>
          <span className="marker">Kurswahl</span>-Helfer Abitur
        </h1>
        <p className="intro">
          Wähle je zwei Leistungskurse, schriftliche Grundkurse, mündliche Grundkurse und Anrechnungskurse.
        </p>
      </header>

      <div className="steuerung">
        <div className="modus" role="group" aria-label="Modus">
          {MODI.map((m) => (
            <button key={m.id} type="button" aria-pressed={modus === m.id} onClick={() => setModus(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
        <button type="button" className="zuruecksetzen" onClick={zuruecksetzen} disabled={!hatAuswahl}>
          Zurücksetzen
        </button>
      </div>
      <p className="modus-hinweis">{MODI.find((m) => m.id === modus)!.hinweis}</p>

      {sackgasse && (
        <div className="sackgasse" role="alert">
          Deine aktuelle Auswahl lässt sich nicht mehr regelkonform vervollständigen. Entferne einzelne Fächer oder setze
          die Wahl zurück.
        </div>
      )}

      <div className="raster">
        {KATEGORIEN.map((k) => (
          <section key={k.id} className="kategorie">
            <h2>{k.label}</h2>
            {SLOTS.filter((s) => s.kategorie === k.id).map((slot) => (
              <SlotKarte
                key={slot.id}
                slot={slot}
                gewaehlt={wahl[slot.id]}
                optionen={optionenFuer(slot)}
                onWaehle={(id) => waehle(slot.id, id)}
              />
            ))}
          </section>
        ))}
      </div>

      <RegelStatus wahl={wahl} modus={modus} />

      <footer className="legende">
        Aufgabenfelder: <b>I</b> sprachlich-literarisch-künstlerisch · <b>II</b> gesellschaftswissenschaftlich ·{' '}
        <b>III</b> mathematisch-naturwissenschaftlich
      </footer>
    </main>
  )
}

export default App
