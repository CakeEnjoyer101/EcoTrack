# EcoTrack PWA - Abgabe Checkliste (60 Punkte)

## Start (Express Server + Frontend aus server/public)
- Ein Kommando fuer alles: `cd server && npm run start:full`
- Das baut den Quasar PWA-Client und startet danach Express.
- Aufruf im Browser: `http://localhost:3000`
- API laeuft ueber denselben Host unter `/api/*`.

## 1) Service Worker wird geladen (10)
- Produktionsnah testen: `cd server && npm run start:full`
- In DevTools unter `Application > Service Workers` pruefen.
- Frontend-Build landet in `server/public` (siehe `client/quasar.config.js`).

## 2) App installierbar + manifest vollstaendig (10)
- Manifest ist in [`client/quasar.config.js`](client/quasar.config.js) unter `pwa.manifest` gepflegt.
- Wichtige Felder: `name`, `short_name`, `display`, `theme_color`, `background_color`, `icons`.
- Installierbarkeit im Browser mit "App installieren" pruefen.

## 3) CRD/CRU funktioniert (10)
- `Create`: neuer Mood-Eintrag im UI speichern.
- `Read`: Tabelle zeigt Eintraege aus DB.
- Frontend: [`client/src/pages/IndexPage.vue`](client/src/pages/IndexPage.vue)
- Backend Routes: [`server/src/api/routes/routes.js`](server/src/api/routes/routes.js)

## 4) Workbox Integration fuer statische Inhalte (5)
- Quasar PWA mit `workboxMode: 'InjectManifest'` aktiv.
- Konfiguration in [`client/quasar.config.js`](client/quasar.config.js) unter `pwa.workboxOptions`.

## 5) Sensor eingebunden (5)
- Startseite nutzt Browser Sensor APIs (Kamera, Mikrofon, Licht).
- Sensorwerte koennen als `sensor_readings` gespeichert werden.
- Datei: [`client/src/pages/IndexPage.vue`](client/src/pages/IndexPage.vue)

## 6) Persistente Datenspeicherung mit Pinia (10)
- Pinia Boot: [`client/src/boot/pinia.js`](client/src/boot/pinia.js)
- Zentraler Store + localStorage Persistenz + Server Calls:
  [`client/src/stores/ecotrack-store.js`](client/src/stores/ecotrack-store.js)

## 7) GitHub Release Link (10)
1. Commit + Push auf GitHub.
2. Tag anlegen (z. B. `v1.0.0`).
3. GitHub Release aus dem Tag erstellen.
4. Abgabe: direkter Link wie  
   `https://github.com/<user>/<repo>/releases/tag/v1.0.0`

## API Endpoints (relevant fuer Vorfuehrung)
- `GET /api/mood-entries`
- `POST /api/mood-entries`
- `PUT /api/mood-entries/:id`
- `GET /api/sensor-readings`
- `POST /api/sensor-readings`
- `GET /api/health`
