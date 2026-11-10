import { useMemo } from 'react'
import { freieAnzeige, gefuehrteAnzeige } from './anzeige'
import { RegelStatus } from './components/RegelStatus'
import { SlotKarte } from './components/SlotKarte'
import { istVervollstaendigbar } from './domain/solver'
import { KATEGORIEN, SLOTS, leereWahl, type SlotId } from './domain/types'
import { normalisiere, useGespeicherterZustand, type Modus } from './zustand'

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

  const anzeige = useMemo(() => (modus === 'gefuehrt' ? gefuehrteAnzeige(wahl) : freieAnzeige()), [modus, wahl])
  const sackgasse = modus === 'gefuehrt' && !istVervollstaendigbar(wahl)

  const waehle = (slot: SlotId, id: string | null) => setZustand((z) => ({ ...z, wahl: { ...z.wahl, [slot]: id } }))
  const setModus = (m: Modus) => setZustand((z) => ({ ...z, modus: m }))
  const zuruecksetzen = () => setZustand((z) => ({ ...z, wahl: leereWahl() }))
  const grundzustand = normalisiere({ modus, wahl: leereWahl() }).wahl
  const hatAuswahl = SLOTS.some((s) => wahl[s.id] !== grundzustand[s.id])

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
                anzeige={anzeige[slot.id]}
                zeigeFeld={modus === 'frei'}
                onWaehle={(id) => waehle(slot.id, id)}
              />
            ))}
          </section>
        ))}
      </div>

      <RegelStatus wahl={wahl} modus={modus} />

      {modus === 'frei' && (
        <footer className="legende">
          Aufgabenfelder: <b>I</b> sprachlich-literarisch-künstlerisch · <b>II</b> gesellschaftswissenschaftlich ·{' '}
          <b>III</b> mathematisch-naturwissenschaftlich
        </footer>
      )}
    </main>
  )
}

export default App
