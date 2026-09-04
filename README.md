# AVS Rubino - Admin Panel

Pannello di gestione riservato al personale dell'Ambulatorio Veterinario Specialistico Rubino. Fornisce un'interfaccia protetta per la gestione degli orari clinici, delle eccezioni straordinarie, degli avvisi sul sito web e degli utenti di backoffice.

## Ecosistema AVS Rubino

Questo repository è uno dei 5 moduli dell'ecosistema digitale dell'Ambulatorio Veterinario Specialistico Rubino. Panoramica completa, architettura e flussi: **[github.com/avs-rubino](https://github.com/avs-rubino)**

| Modulo | Ruolo |
|---|---|
| [avs-rubino-frontend](https://github.com/avs-rubino/avs-rubino-frontend) | Portale web pubblico |
| **avs-rubino-admin** | Pannello di amministrazione |
| [avs-rubino-backend](https://github.com/avs-rubino/avs-rubino-backend) | API REST centrale |
| [avs-rubino-voice-api](https://github.com/avs-rubino/avs-rubino-voice-api) | Microservizio NLU vocale |
| [avs-rubino-voice-pwa](https://github.com/avs-rubino/avs-rubino-voice-pwa) | PWA vocale gestione orari |

> **Dipendenze dirette di questo modulo:** [avs-rubino-backend](https://github.com/avs-rubino/avs-rubino-backend) (CRUD /api/admin/* con JWT Firebase)

---

## Architettura e Tecnologie

- **Framework**: React 18 (SPA)
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Autenticazione**: Firebase Auth con Custom Claims (RBAC)
- **HTTP Client**: Axios con request interceptor per Bearer Token
- **Feedback UI**: React Hot Toast
- **Testing**: Vitest, React Testing Library, jsdom
- **Hosting**: Firebase Hosting

## Controllo degli Accessi (RBAC)

L'accesso alle viste operative è vincolato allo stato di autenticazione e ai ruoli definiti nei custom claims del token JWT:
- **Super_Admin**: Accesso completo a gestione utenti, orari e avvisi.
- **Editor_Admin**: Accesso limitato all'aggiornamento di orari ed eccezioni.

## Resilienza UI (`ScheduleEditor`)

- **Parsing difensivo**: Normalizzazione automatica delle eccezioni e degli orari settimanali di default contro strutture dati parziali o assenti.
- **Ordinamento cronologico**: Ordinamento automatico per data (`dateFrom`) via `useMemo`.
- **Formattazione robusta**: Gestione sicura di date mancanti o non conformi evitando render di `Invalid Date`.

## Prerequisiti

- **Node.js**: >= 18.x
- **npm**: >= 8.x

## Setup Locale

1. Installazione delle dipendenze:
   ```bash
   npm install
   ```

2. Configurazione dell'ambiente:
   ```bash
   cp .env.example .env
   ```

3. Avvio del server di sviluppo:
   ```bash
   npm run dev
   ```
   L'applicazione è accessibile all'indirizzo `http://localhost:5173`.

## Variabili d'Ambiente

Le credenziali e gli endpoint devono essere definiti nel file `.env`:

| Variabile | Tipo | Descrizione | Default / Esempio | Richiesta |
|---|---|---|---|---|
| `VITE_API_URL` | String | URL base del microservizio backend REST | `http://localhost:5000` | Sì |
| `VITE_FIREBASE_API_KEY` | String | API Key del progetto Firebase | - | Sì |
| `VITE_FIREBASE_AUTH_DOMAIN` | String | Dominio di autenticazione Firebase | `project.firebaseapp.com` | Sì |
| `VITE_FIREBASE_PROJECT_ID` | String | ID del progetto Google Cloud / Firebase | `vet-clinics-493413` | Sì |
| `VITE_FIREBASE_STORAGE_BUCKET` | String | Bucket per l'upload di file multimediali | `project.appspot.com` | Sì |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | String | Sender ID Firebase Messaging | - | Sì |
| `VITE_FIREBASE_APP_ID` | String | ID dell'applicazione Firebase Web | - | Sì |

## Script Disponibili

| Comando | Descrizione |
|---|---|
| `npm run dev` | Avvia il server di sviluppo locale |
| `npm run build` | Compila l'applicazione per la produzione nella directory `dist/` |
| `npm run preview` | Esegue un server locale per testare la build generata |
| `npm test` | Esegue la suite di test Vitest in modalità singola run |
| `npm run test:watch` | Avvia la suite di test in modalità osservatore continuo |
| `npm run test:coverage` | Genera il report di copertura con provider v8 |

## Testing

La test suite automatizzata sfrutta **Vitest** con ambiente DOM simulato tramite `jsdom`:

```bash
npm test
```

### Mock di Firebase Auth
Le suite di test sono isolate dall'infrastruttura di autenticazione remota. In `src/setupTests.js` è configurato il mock globale del modulo `firebase/auth`, che intercetta i metodi `getAuth`, `signInWithEmailAndPassword`, `signOut` e `onAuthStateChanged`, consentendo l'emulazione deterministica di utenti autenticati, token JWT scaduti o ruoli RBAC eterogenei.

Aree coperte:
- `src/__tests__/ProtectedRoute.test.jsx`: Protezione delle rotte basata su ruoli (Super_Admin, Editor_Admin) e gestione degli stati non autenticati.
- `src/__tests__/ScheduleEditor.test.jsx`: Parsing delle eccezioni orarie, mutazioni stato e persistenza tramite chiamate API.

## CI/CD e Deployment

Il rilascio in produzione è gestito tramite GitHub Actions (`.github/workflows/deploy.yml`):
- All'unione del codice sul ramo `main`, il runner automatizza la compilazione e distribuisce la cartella `dist/` su **Firebase Hosting** (Target: `vet-clinics-admin-panel`).

<!-- ecosystem: avs-rubino -->
