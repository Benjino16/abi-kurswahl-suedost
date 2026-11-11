import { useMemo } from 'react'
import { freieAnzeige, gefuehrteAnzeige } from './anzeige'
import { Notenrechner } from './components/Notenrechner'
import { RegelStatus } from './components/RegelStatus'
import { SlotKarte } from './components/SlotKarte'
import { KurswahlUebersicht } from './components/Uebersicht'
import { GEWICHT, leerePunkte } from './domain/noten'
import { istVervollstaendigbar } from './domain/solver'
import { KATEGORIEN, SLOTS, leereWahl, type SlotId } from './domain/types'
import { normalisiere, useGespeicherterZustand, type Ansicht, type Modus } from './zustand'

const TABS: { id: Ansicht; label: string }[] = [
  { id: 'wahl', label: 'Kurswahl' },
  { id: 'noten', label: 'Notenrechner' },
]

const MODI: { id: Modus; label: string; hinweis: string }[] = [
  {
    id: 'gefuehrt',
    label: 'Automatisch',
    hinweis: 'Es werden nur Fächer angezeigt, mit denen sich deine Wahl noch regelkonform vervollständigen lässt.',
  },
  {
    id: 'frei',
    label: 'Frei',
    hinweis: 'Alle angebotenen Fächer sind wählbar. Sobald alle Kurse belegt sind, wird deine Wahl gegen die Regeln geprüft.',
  },
]

const NOTEN_HINWEIS = `Stelle für jeden Kurs deine (erwartete) Note ein. Gerechnet wird in Punkten: LK ×${GEWICHT.lk}, GK ×${GEWICHT.gk}, mGK und AK ×${GEWICHT.mgk}.`

function App() {
  const [zustand, setZustand] = useGespeicherterZustand()
  const { modus, ansicht, wahl, punkte, skala } = zustand

  const anzeige = useMemo(() => (modus === 'gefuehrt' ? gefuehrteAnzeige(wahl) : freieAnzeige()), [modus, wahl])
  const sackgasse = ansicht === 'wahl' && modus === 'gefuehrt' && !istVervollstaendigbar(wahl)

  const waehle = (slot: SlotId, id: string | null) => setZustand((z) => ({ ...z, wahl: { ...z.wahl, [slot]: id } }))
  const setAnsicht = (a: Ansicht) => setZustand((z) => ({ ...z, ansicht: a }))
  const setModus = (m: Modus) => setZustand((z) => ({ ...z, modus: m }))
  const zuruecksetzen = () =>
    setZustand((z) => (z.ansicht === 'noten' ? { ...z, punkte: leerePunkte() } : { ...z, wahl: leereWahl() }))
  const grundzustand = normalisiere({ ...zustand, wahl: leereWahl() }).wahl
  const hatAuswahl =
    ansicht === 'noten'
      ? SLOTS.some((s) => punkte[s.id] !== null)
      : SLOTS.some((s) => wahl[s.id] !== grundzustand[s.id])

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
        <div className="modus" role="group" aria-label="Ansicht">
          {TABS.map((t) => (
            <button key={t.id} type="button" aria-pressed={ansicht === t.id} onClick={() => setAnsicht(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <button type="button" className="zuruecksetzen" onClick={zuruecksetzen} disabled={!hatAuswahl}>
          Zurücksetzen
        </button>
      </div>
      <p className="modus-hinweis">
        {ansicht === 'noten' ? NOTEN_HINWEIS : MODI.find((m) => m.id === modus)!.hinweis}
      </p>

      {ansicht === 'noten' ? (
        <Notenrechner
          wahl={wahl}
          punkte={punkte}
          skala={skala}
          onPunkte={(slot, p) => setZustand((z) => ({ ...z, punkte: { ...z.punkte, [slot]: p } }))}
          onSkala={(s) => setZustand((z) => ({ ...z, skala: s }))}
        />
      ) : (
        <>
          <div className="umschalter">
            <span>Wahl</span>
            <div className="modus" role="group" aria-label="Modus">
              {MODI.map((m) => (
                <button key={m.id} type="button" aria-pressed={modus === m.id} onClick={() => setModus(m.id)}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {sackgasse && (
            <div className="sackgasse" role="alert">
              Deine aktuelle Auswahl lässt sich nicht mehr regelkonform vervollständigen. Entferne einzelne Fächer oder
              setze die Wahl zurück.
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

          <KurswahlUebersicht wahl={wahl} />

          <RegelStatus wahl={wahl} modus={modus} />

          {modus === 'frei' && (
            <footer className="legende">
              Aufgabenfelder: <b>I</b> sprachlich-literarisch-künstlerisch · <b>II</b> gesellschaftswissenschaftlich ·{' '}
              <b>III</b> mathematisch-naturwissenschaftlich
            </footer>
          )}
        </>
      )}
    </main>
  )
}

export default App
