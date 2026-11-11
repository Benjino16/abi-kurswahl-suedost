import { useRef, type ReactNode } from 'react'
import { fach } from '../domain/faecher'
import { pruefeWahl } from '../domain/regeln'
import { KATEGORIEN, SLOTS, istVollstaendig, type Slot, type Wahl } from '../domain/types'

export interface UebersichtStatus {
  klasse: 'ok' | 'fehler' | 'offen'
  text: string
}

interface Props {
  titel: string
  status: UebersichtStatus
  children: ReactNode
}

/** Knopf, der Inhalte kompakt in einem Overlay zeigt – gedacht zum Abfotografieren. */
export function Uebersicht({ titel, status, children }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  return (
    <>
      <button type="button" className="uebersicht-knopf" onClick={() => dialog.current?.showModal()}>
        Übersicht anzeigen
      </button>
      <dialog
        ref={dialog}
        className="uebersicht"
        aria-label={titel}
        // Klick auf den abgedunkelten Hintergrund schließt das Overlay.
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
      >
        <div className="uebersicht-kopf">
          <h2>{titel}</h2>
          <button type="button" className="uebersicht-schliessen" aria-label="Schließen" onClick={() => dialog.current?.close()}>
            ✕
          </button>
        </div>
        {children}
        <p className={`uebersicht-status ${status.klasse}`}>{status.text}</p>
      </dialog>
    </>
  )
}

interface KurseProps {
  wahl: Wahl
  /** Text für Kurse ohne gewähltes Fach. */
  leer?: string
  zusatz?: (slot: Slot) => string
}

/** Alle Kurse nach Kursart gruppiert; `zusatz` erscheint rechtsbündig in der Zeile. */
export function UebersichtKurse({ wahl, leer = 'offen', zusatz }: KurseProps) {
  return KATEGORIEN.map((k) => (
    <section key={k.id} className="uebersicht-gruppe">
      <h3>{k.label}</h3>
      <dl>
        {SLOTS.filter((s) => s.kategorie === k.id).map((s) => (
          <div key={s.id}>
            <dt>{s.label}</dt>
            <dd className={wahl[s.id] ? undefined : 'leer'}>{wahl[s.id] ? fach(wahl[s.id]!).name : leer}</dd>
            {zusatz && <dd className="uebersicht-zusatz">{zusatz(s)}</dd>}
          </div>
        ))}
      </dl>
    </section>
  ))
}

export function KurswahlUebersicht({ wahl }: { wahl: Wahl }) {
  const offen = SLOTS.filter((s) => wahl[s.id] === null).length
  const verletzt = istVollstaendig(wahl) ? new Set(pruefeWahl(wahl).map((v) => v.regel.id)).size : 0
  const status: UebersichtStatus =
    offen > 0
      ? { klasse: 'offen', text: offen === 1 ? 'Noch 1 Kurs offen' : `Noch ${offen} Kurse offen` }
      : verletzt > 0
        ? { klasse: 'fehler', text: verletzt === 1 ? 'Verletzt 1 Regel' : `Verletzt ${verletzt} Regeln` }
        : { klasse: 'ok', text: '✓ Regelkonform' }

  return (
    <Uebersicht titel="Meine Kurswahl" status={status}>
      <UebersichtKurse wahl={wahl} />
    </Uebersicht>
  )
}
