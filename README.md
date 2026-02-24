# EcoTrack PWA - Abgabe Checkliste (60 Punkte)

## 1) Service Worker wird geladen (10)
- PWA-Mode starten: `cd client && npm run dev:pwa`
- In DevTools unter `Application > Service Workers` pruefen.
- Build fuer Abgabe: `cd client && npm run build:pwa`

## 2) App installierbar + manifest vollstaendig (10)
- Manifest ist in [`client/quasar.config.js`](client/quasar.config.js) unter `pwa.manifest` gepflegt.
- Wichtige Felder: `name`, `short_name`, `display`, `theme_color`, `background_color`, `icons`.
- Installierbarkeit im Browser mit "App installieren" pruefen.

## 3) CRU funktioniert (10)
- `Create`: neuer Mood-Eintrag im UI speichern.
- `Read`: Tabelle zeigt Eintraege aus DB.
- `Update`: Eintrag bearbeiten ueber Edit-Dialog.
- Frontend: [`client/src/pages/MoodTrackerPage.vue`](client/src/pages/MoodTrackerPage.vue)
- Backend Routes: [`server/src/api/routes/routes.js`](server/src/api/routes/routes.js)

## 4) Workbox Integration fuer statische Inhalte (5)
- Quasar PWA mit `workboxMode: 'GenerateSW'` aktiv.
- Konfiguration in [`client/quasar.config.js`](client/quasar.config.js) unter `pwa.workboxOptions`.

## 5) Sensor eingebunden (5)
- Sensorseite nutzt Browser Sensor APIs (z. B. Licht, GPS, Mikrofon).
- Sensorwerte koennen als `sensor_readings` gespeichert werden.
- Datei: [`client/src/pages/SensorsPage.vue`](client/src/pages/SensorsPage.vue)

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
