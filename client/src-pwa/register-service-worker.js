import { register } from 'register-service-worker'

register(process.env.SERVICE_WORKER_FILE, {

  ready () {
    console.info('[PWA] Service worker ready.')
  },

  registered (registration) {
    if (registration) {
      registration.update()
    }
  },

  cached () {
    console.info('[PWA] Inhalte wurden fuer Offlinebetrieb gecacht.')
  },

  updatefound () {
    console.info('[PWA] Update gefunden.')
  },

  updated () {
    console.info('[PWA] Neue Version installiert. Seite wird neu geladen.')
    window.location.reload()
  },

  offline () {
    console.info('[PWA] Offline Modus aktiv.')
  },

  error (err) {
    console.error('[PWA] Service worker Fehler:', err)
  }
})

