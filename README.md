# AVS Rubino - Admin Panel

Applicazione web riservata allo staff dell'Ambulatorio Veterinario Specialistico Rubino. Fornisce un'interfaccia protetta per gestire le configurazioni cliniche, come l'inserimento di avvisi sul sito pubblico, l'upload di immagini nella galleria Cloud Storage, e la gestione CRUD delle variazioni d'orario (eccezioni).

## 🏛️ Ecosistema AVS Rubino

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

## 🚀 Tecnologie Principali
- **Core:** React, Vite
- **Styling:** Tailwind CSS
- **Autenticazione:** Firebase Auth
- **Iconografia:** Lucide React
- **Hosting & Deploy:** Firebase Hosting

## 🔐 Controllo Accessi (RBAC)
L'accesso al pannello è rigorosamente limitato tramite Firebase Authentication. 
Le azioni di modifica sono filtrate in base al ruolo assegnato al token dell'utente (Custom Claims):
- **Super_Admin**: Controllo totale su tutte le impostazioni.
- **Editor_Admin**: Permessi di scrittura per la gestione degli orari.

## ⏱️ Gestione Orari & Resilienza UI (`ScheduleEditor`)
Il componente `ScheduleEditor` si interfaccia con il backend REST per la gestione degli orari predefiniti e delle eccezioni:
- **Parsing Difensivo (`parseSchedule`)**: Garantisce la coerenza degli array `defaults` e `overrides`, prevenendo errori di renderizzazione a fronte di risposte parziali o modifiche remote (es. sovrascritture o pulizie silenti dal backend/PWA).
- **Ordinamento Cronologico (`sortedOverrides`)**: Le eccezioni orarie vengono ordinate automaticamente per data (`dateFrom`) tramite `useMemo`, assicurando una consultazione chiara per il personale clinico.
- **Formattazione Data Robusta (`formatDate`)**: Protegge l'interfaccia da date corrotte o non conformi, evitando il rendering della stringa `Invalid Date` con fallback pulito (`—`).


## 📋 Prerequisiti
- **Node.js:** v18.x o superiore
- **npm:** v8.x o superiore
- **Firebase CLI:** (opzionale, per test di deploy locale)

## 🛠️ Installazione e Avvio Locale

1. Clona il repository e installa le librerie:
   ```bash
   npm install
   ```

2. Configura le variabili d'ambiente:
   Crea il file `.env` copiando il template di riferimento. 
   ```bash
   cp .env.example .env
   ```
   Compila le chiavi API del progetto Firebase per inizializzare il client auth.

3. Esegui in ambiente di sviluppo:
   ```bash
   npm run dev
   ```
   L'applicativo partirà all'indirizzo `http://localhost:5173`.

## 🏗️ Build per la Produzione

Per produrre una build statica minimizzata:
```bash
npm run build
```
L'output si troverà nella directory `dist/`.

## 🔄 Integrazione Continua (CI/CD)

Il deployment è gestito in modalità serverless su **Firebase Hosting** (Target: `vet-clinics-admin-panel`).
Al push sul branch `main`, GitHub Actions (`.github/workflows/deploy.yml`) si occupa automaticamente della build React e della distribuzione dell'artefatto statico sui CDN globali di Firebase.
