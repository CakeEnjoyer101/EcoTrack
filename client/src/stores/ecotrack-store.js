import { defineStore } from 'pinia'
import { moodAPI, sensorAPI } from 'src/services/api'

const STORAGE_KEY = 'ecotrack-store-v1'

const defaultState = () => ({
  moodEntries: [],
  sensorReadings: [],
  settings: {
    darkMode: false,
    notifications: true,
    autoStartSensors: false,
    saveSensorData: true,
  },
  loading: false,
  error: null,
  initialized: false,
})

export const useEcoTrackStore = defineStore('ecotrack', {
  state: defaultState,

  getters: {
    recentMoodEntries: (state) => state.moodEntries.slice(0, 10),
    recentSensorReadings: (state) => state.sensorReadings.slice(0, 10),
  },

  actions: {
    setError(error) {
      this.error = error
    },

    clearError() {
      this.error = null
    },

    loadFromLocalStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
          this.initialized = true
          return
        }

        const parsed = JSON.parse(raw)
        this.moodEntries = Array.isArray(parsed.moodEntries) ? parsed.moodEntries : []
        this.sensorReadings = Array.isArray(parsed.sensorReadings) ? parsed.sensorReadings : []
        this.settings = { ...this.settings, ...(parsed.settings || {}) }
      } catch (error) {
        this.setError(`Lokale Daten konnten nicht geladen werden: ${error.message}`)
      } finally {
        this.initialized = true
      }
    },

    saveToLocalStorage() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          moodEntries: this.moodEntries,
          sensorReadings: this.sensorReadings,
          settings: this.settings,
        }),
      )
    },

    async fetchMoodEntries() {
      this.loading = true
      this.clearError()
      try {
        const response = await moodAPI.getAll()
        this.moodEntries = response.data
        this.saveToLocalStorage()
      } catch (error) {
        this.setError(`Mood-Eintraege konnten nicht geladen werden: ${error.message}`)
      } finally {
        this.loading = false
      }
    },

    async createMoodEntry(payload) {
      this.loading = true
      this.clearError()
      try {
        const response = await moodAPI.create(payload)
        this.moodEntries.unshift(response.data)
        this.saveToLocalStorage()
        return response.data
      } catch (error) {
        this.setError(`Mood-Eintrag konnte nicht erstellt werden: ${error.message}`)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateMoodEntry(id, payload) {
      this.loading = true
      this.clearError()
      try {
        const response = await moodAPI.update(id, payload)
        const index = this.moodEntries.findIndex((entry) => entry.id === id)
        if (index >= 0) {
          this.moodEntries[index] = response.data
        }
        this.saveToLocalStorage()
        return response.data
      } catch (error) {
        this.setError(`Mood-Eintrag konnte nicht aktualisiert werden: ${error.message}`)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchSensorReadings() {
      this.loading = true
      this.clearError()
      try {
        const response = await sensorAPI.getAll()
        this.sensorReadings = response.data
        this.saveToLocalStorage()
      } catch (error) {
        this.setError(`Sensor-Daten konnten nicht geladen werden: ${error.message}`)
      } finally {
        this.loading = false
      }
    },

    async createSensorReading(payload) {
      this.clearError()
      try {
        const response = await sensorAPI.create(payload)
        this.sensorReadings.unshift(response.data)
        this.saveToLocalStorage()
        return response.data
      } catch (error) {
        this.setError(`Sensor-Wert konnte nicht gespeichert werden: ${error.message}`)
        throw error
      }
    },

    updateSettings(patch) {
      this.settings = { ...this.settings, ...patch }
      this.saveToLocalStorage()
    },
  },
})

