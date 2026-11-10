import { FAECHER } from './domain/faecher'
import { KATEGORIE_LABEL, ANZAHL_PRO_KATEGORIE, type Kategorie } from './domain/types'

function App() {
  return (
    <main>
      <h1>Kurswahl-Helfer Abitur</h1>
      <ul>
        {(Object.keys(KATEGORIE_LABEL) as Kategorie[]).map((k) => (
          <li key={k}>
            {ANZAHL_PRO_KATEGORIE[k]}× {KATEGORIE_LABEL[k]}
          </li>
        ))}
      </ul>
      <p>{FAECHER.length} Fächer geladen.</p>
    </main>
  )
}

export default App
