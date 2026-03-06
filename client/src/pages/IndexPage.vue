<template>
  <q-page class="entry-page q-pa-md">
    <div class="hero row items-center q-mb-lg">
      <div class="col">
        <h1 class="text-h4 text-primary text-weight-bold q-mb-xs">Stimmungseintrag</h1>
        <p class="text-subtitle1 text-grey-7 q-mb-none">Stimmung, Foto und Sensorwerte als Datensatz speichern</p>
      </div>
      <div class="col-auto action-with-tooltip">
        <q-btn flat round icon="refresh" color="primary" :loading="loading" :disable="isOffline" @click="loadData" />
        <q-tooltip>{{ isOffline ? offlineActionHint : 'Daten neu laden' }}</q-tooltip>
      </div>
    </div>

    <q-banner v-if="isOffline" rounded class="offline-banner q-mb-md">
      <template #avatar>
        <q-icon name="cloud_off" color="warning" />
      </template>
      Offline-Modus aktiv. Speichern, Loeschen und Synchronisieren sind derzeit deaktiviert.
    </q-banner>

    <q-card class="capture-card q-mb-lg">
      <q-card-section>
        <div class="text-h6">Eingabe</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-select
              v-model="form.mood"
              :options="moodOptions"
              emit-value
              map-options
              label="Stimmung"
              outlined
            />
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              v-model.number="form.energy_level"
              type="number"
              min="1"
              max="10"
              label="Energie (1-10)"
              outlined
            />
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              v-model.number="form.stress_level"
              type="number"
              min="1"
              max="10"
              label="Stress (1-10)"
              outlined
            />
          </div>

          <div class="col-12">
            <q-input v-model="form.notes" label="Notizen" outlined />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="text-h6 q-mb-md">Sensoren</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-card flat bordered class="sensor-card">
              <q-card-section>
                <div class="text-subtitle1 text-weight-medium q-mb-sm">Kamera</div>
                <div class="text-caption text-grey-7 q-mb-sm">Live-Kamera aktivieren und Bild aufnehmen</div>
                <div class="text-caption text-primary q-mb-sm">Aktive Kamera: {{ cameraFacingModeLabel() }}</div>
                <div class="text-caption text-grey-7 q-mb-sm">Falls keine Kamera verfuegbar ist: Bilddatei auswaehlen.</div>

                <video
                  v-show="cameraActive"
                  ref="cameraVideo"
                  class="camera-video q-mb-sm"
                  autoplay
                  playsinline
                  muted
                />
                <div v-if="!cameraActive" class="text-caption text-grey-7 q-mb-sm">Kamera ist nicht aktiv</div>

                <img
                  v-if="cameraPhoto"
                  :src="cameraPhoto"
                  alt="Aufgenommenes Kamerabild"
                  class="camera-preview q-mb-sm"
                />
                <div v-else class="text-caption text-grey-7 q-mb-sm">Noch kein Bild aufgenommen</div>

                <q-file
                  v-model="photoFile"
                  dense
                  outlined
                  accept="image/*"
                  label="Bilddatei waehlen (Fallback)"
                  class="q-mb-sm"
                  @update:model-value="onPhotoFilePicked"
                />

                <div class="q-gutter-sm">
                  <q-btn
                    :label="cameraActive ? 'Kamera stoppen' : 'Kamera starten'"
                    :color="cameraActive ? 'negative' : 'primary'"
                    @click="toggleCamera"
                  />
                  <q-btn color="primary" label="Foto aufnehmen" :disable="!cameraActive" @click="captureCameraPhoto" />
                  <q-btn
                    flat
                    color="primary"
                    :label="`Kamera drehen (${cameraFacingModeLabel()})`"
                    @click="rotateCamera"
                  />
                  <q-btn flat color="negative" label="Bild entfernen" @click="clearCameraPhoto" />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card flat bordered class="sensor-card">
              <q-card-section>
                <div class="text-subtitle1 text-weight-medium q-mb-sm">Umgebungslautstaerke (dB)</div>
                <div class="text-caption q-mb-sm">
                  {{ noiseActive ? 'Messung laeuft...' : 'Messung gestoppt' }}
                </div>
                <div class="text-h6 q-mb-sm">
                  {{ noiseLevel !== null ? `${noiseLevel} dB` : 'Kein Wert' }}
                </div>
                <div class="q-gutter-sm">
                  <q-btn color="primary" label="Messung starten" :disable="noiseActive" @click="startNoiseMeasurement" />
                  <q-btn color="negative" label="Messung stoppen" :disable="!noiseActive" @click="stopNoiseMeasurement" />
                  <q-btn flat color="negative" label="Wert loeschen" @click="clearNoiseMeasurement" />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card flat bordered class="sensor-card">
              <q-card-section>
                <div class="text-subtitle1 text-weight-medium q-mb-sm">Lichtsensor</div>
                <div class="text-caption q-mb-sm">
                  {{ lightSupported ? 'Aktueller Wert in Lux' : 'Nicht verfuegbar (z.B. Safari auf iPhone)' }}
                </div>
                <div class="text-h6 q-mb-sm">
                  {{ lightValue !== null ? `${lightValue} lux` : 'Kein Wert' }}
                </div>
                <div v-if="lightSupported" class="q-gutter-sm">
                  <q-btn
                    color="primary"
                    label="Lichtsensor starten"
                    :disable="!lightSupported"
                    @click="startLightSensor"
                  />
                  <q-btn flat color="negative" label="Stoppen" @click="stopLightSensor" />
                </div>
                <div v-else class="q-gutter-sm">
                  <q-input
                    v-model.number="manualLightValue"
                    dense
                    outlined
                    type="number"
                    min="0"
                    label="Lichtwert manuell (lux)"
                  />
                  <q-btn color="primary" label="Wert uebernehmen" @click="applyManualLightValue" />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat color="grey-8" label="Zuruecksetzen" @click="resetFormAndSensors" />
        <div class="action-with-tooltip">
          <q-btn color="primary" icon="save" round :loading="saving" :disable="isOffline" @click="saveDataset" />
          <q-tooltip>{{ isOffline ? offlineActionHint : 'Datensatz speichern' }}</q-tooltip>
        </div>
      </q-card-actions>
    </q-card>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-7">
        <q-card class="mood-wall-card">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-h6 text-weight-bold">Mood Wall</div>
              <div class="text-caption text-grey-7">Jeder Eintrag mit Foto, Lautstaerke und Licht</div>
            </div>
            <q-chip color="primary" text-color="white" icon="collections_bookmark">
              {{ moodEntries.length }} Eintraege
            </q-chip>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div v-if="loading" class="row justify-center q-py-xl">
              <q-spinner color="primary" size="40px" />
            </div>

            <div v-else-if="moodEntries.length === 0" class="mood-empty-state">
              <q-icon name="filter_none" size="44px" />
              <div class="text-subtitle1 text-weight-medium q-mt-sm">Noch keine Stimmungseintraege</div>
              <div class="text-caption text-grey-7">Nimm ein Foto auf und speichere deinen ersten Datensatz.</div>
            </div>

            <div v-else class="mood-grid">
              <q-card
                v-for="entry in moodEntries"
                :key="entry.id"
                class="mood-entry-card"
                :style="moodAccentStyle(entry.mood)"
              >
                <div
                  v-if="getEntryImageSrc(entry)"
                  class="mood-entry-image cursor-pointer"
                  @click="openImagePreview(entry)"
                >
                  <img
                    :src="getEntryImageSrc(entry)"
                    alt="Mood Eintrag"
                    class="mood-entry-image-img"
                    @error="markEntryImageBroken(entry)"
                  >
                  <div class="entry-image-overlay">
                    <q-chip dense :color="moodColor(entry.mood)" text-color="white" :icon="moodIcon(entry.mood)">
                      {{ moodLabel(entry.mood) }}
                    </q-chip>
                    <span class="entry-time">{{ formatDate(entry.timestamp) }}</span>
                  </div>
                </div>

                <div v-else class="mood-entry-image mood-entry-image--placeholder">
                  <q-icon name="image_not_supported" size="36px" />
                  <div class="text-caption q-mt-sm">Kein Bild gespeichert</div>
                </div>

                <q-card-section class="q-pt-sm">
                  <div class="row q-col-gutter-sm q-mb-sm">
                    <div class="col-6">
                      <div class="metric-chip metric-chip--energy">
                        <q-icon name="bolt" size="16px" />
                        <span>{{ entry.energy_level }}/10 Energie</span>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="metric-chip metric-chip--stress">
                        <q-icon name="monitor_heart" size="16px" />
                        <span>{{ entry.stress_level }}/10 Stress</span>
                      </div>
                    </div>
                  </div>

                  <div class="entry-bars q-mb-md">
                    <div class="bar-label row items-center justify-between">
                      <span>Energie</span>
                      <strong>{{ entry.energy_level }}/10</strong>
                    </div>
                    <q-linear-progress
                      rounded
                      size="8px"
                      color="positive"
                      track-color="grey-3"
                      :value="normalizeScore(entry.energy_level)"
                    />

                    <div class="bar-label row items-center justify-between q-mt-sm">
                      <span>Stress</span>
                      <strong>{{ entry.stress_level }}/10</strong>
                    </div>
                    <q-linear-progress
                      rounded
                      size="8px"
                      color="negative"
                      track-color="grey-3"
                      :value="normalizeScore(entry.stress_level)"
                    />
                  </div>

                  <div class="row q-col-gutter-sm q-mb-sm">
                    <div class="col-6">
                      <q-chip square dense color="teal-7" text-color="white" icon="graphic_eq" class="sensor-chip">
                        {{ formatSensorMetric(entry.noise_level_db, 'dB') }}
                      </q-chip>
                    </div>
                    <div class="col-6">
                      <q-chip square dense color="amber-8" text-color="white" icon="light_mode" class="sensor-chip">
                        {{ formatSensorMetric(entry.light_level_lux, 'lux') }}
                      </q-chip>
                    </div>
                  </div>

                  <div class="notes-box">
                    <div class="text-caption text-grey-7">Notizen</div>
                    <div class="text-body2">{{ entry.notes || 'Keine Notizen' }}</div>
                  </div>

                  <div class="row q-col-gutter-sm q-mt-md">
                    <div class="col-6 text-center">
                      <q-btn
                        unelevated
                        color="primary"
                        icon="edit"
                        round
                        @click="openEditEntry(entry)"
                      >
                        <q-tooltip>Bearbeiten</q-tooltip>
                      </q-btn>
                    </div>
                    <div class="col-6 text-center">
                      <div class="action-with-tooltip">
                        <q-btn
                          flat
                          color="negative"
                          icon="delete"
                          round
                          :disable="isOffline"
                          @click="deleteEntry(entry)"
                        />
                        <q-tooltip>{{ isOffline ? offlineActionHint : 'Loeschen' }}</q-tooltip>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-5">
        <q-card class="sensor-history-card">
          <q-card-section>
            <div class="text-h6 text-weight-bold">Sensor Historie</div>
          </q-card-section>
          <q-table
            flat
            bordered
            :rows="sensorReadings"
            :columns="sensorColumns"
            row-key="id"
            :rows-per-page-options="[5, 10, 20]"
            :loading="loading"
          >
            <template #body-cell-timestamp="props">
              <q-td :props="props">{{ formatDate(props.row.timestamp) }}</q-td>
            </template>

            <template #body-cell-data="props">
              <q-td :props="props">{{ summarizeSensorReading(props.row) }}</q-td>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="imageDialogOpen" maximized>
      <q-card class="image-dialog-card">
        <q-bar class="bg-dark text-white">
          <div class="text-body1">{{ imageDialogTitle }}</div>
          <q-space />
          <q-btn flat dense round icon="close" v-close-popup />
        </q-bar>
        <q-card-section class="dialog-image-wrapper">
          <img :src="imageDialogSource" alt="Mood Eintrag Bild" class="dialog-image" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="editDialogOpen">
      <q-card class="edit-dialog-card">
        <q-card-section class="edit-dialog-header row items-center no-wrap">
          <div class="text-h6 text-weight-bold">Eintrag bearbeiten</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator />

        <q-card-section class="edit-dialog-body">
          <q-select
            v-model="editForm.mood"
            :options="moodOptions"
            emit-value
            map-options
            label="Stimmung"
            dense
            outlined
          />

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="editForm.energy_level"
                type="number"
                min="1"
                max="10"
                label="Energie (1-10)"
                dense
                outlined
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="editForm.stress_level"
                type="number"
                min="1"
                max="10"
                label="Stress (1-10)"
                dense
                outlined
              />
            </div>
          </div>

          <q-input
            v-model="editForm.notes"
            type="textarea"
            autogrow
            :rows="3"
            label="Notizen"
            dense
            outlined
          />

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="editForm.noise_level_db"
                type="number"
                min="0"
                label="Lautstaerke (dB)"
                dense
                outlined
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="editForm.light_level_lux"
                type="number"
                min="0"
                label="Licht (lux)"
                dense
                outlined
              />
            </div>
          </div>

          <div class="edit-photo-block">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle2 text-weight-medium">Foto im Eintrag</div>
              <q-chip
                dense
                square
                :color="editForm.camera_image_data_url ? 'positive' : 'grey-6'"
                text-color="white"
                :icon="editForm.camera_image_data_url ? 'check_circle' : 'hide_image'"
              >
                {{ editForm.camera_image_data_url ? 'Vorhanden' : 'Kein Foto' }}
              </q-chip>
            </div>

            <img
              v-if="editForm.camera_image_data_url"
              :src="editForm.camera_image_data_url"
              alt="Eintrag Foto"
              class="edit-image-preview q-mb-md"
            />
            <div v-else class="edit-image-empty q-mb-md">Kein Bild gespeichert</div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-btn
                  unelevated
                  color="primary"
                  icon="photo_camera"
                  label="Aktuelles Kamera-Foto"
                  class="full-width"
                  :disable="!cameraPhoto"
                  @click="useCurrentCameraPhotoInEdit"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-btn
                  flat
                  color="negative"
                  icon="delete_outline"
                  label="Foto entfernen"
                  class="full-width"
                  @click="clearEditPhoto"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />
        <q-card-actions class="edit-dialog-actions">
          <q-btn flat color="grey-8" label="Abbrechen" v-close-popup />
          <div class="action-with-tooltip">
            <q-btn
              unelevated
              color="primary"
              icon="save"
              label="Aenderungen speichern"
              :loading="editSaving"
              :disable="isOffline"
              @click="saveEditEntry"
            />
            <q-tooltip>{{ isOffline ? offlineActionHint : 'Aenderungen speichern' }}</q-tooltip>
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()

const moodOptions = [
  { label: 'Sehr gut', value: 'sehr_gut' },
  { label: 'Gut', value: 'gut' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Schlecht', value: 'schlecht' },
  { label: 'Sehr schlecht', value: 'sehr_schlecht' },
]

const moodDesign = {
  sehr_gut: { label: 'Sehr gut', color: 'positive', icon: 'sentiment_very_satisfied', accent: '#2e7d32' },
  gut: { label: 'Gut', color: 'teal', icon: 'sentiment_satisfied', accent: '#00897b' },
  neutral: { label: 'Neutral', color: 'blue-grey', icon: 'sentiment_neutral', accent: '#546e7a' },
  schlecht: { label: 'Schlecht', color: 'orange-8', icon: 'sentiment_dissatisfied', accent: '#ef6c00' },
  sehr_schlecht: { label: 'Sehr schlecht', color: 'negative', icon: 'sentiment_very_dissatisfied', accent: '#c62828' },
}

const sensorColumns = [
  { name: 'timestamp', label: 'Zeitpunkt', align: 'left', field: 'timestamp', sortable: true },
  { name: 'sensor_type', label: 'Sensor', align: 'left', field: 'sensor_type', sortable: true },
  { name: 'data', label: 'Daten', align: 'left', field: 'data' },
]
const allowedSensorTypes = ['camera', 'microphone', 'light']

const createDefaultForm = () => ({
  mood: 'neutral',
  energy_level: 5,
  stress_level: 5,
  notes: '',
})

const createDefaultEditForm = () => ({
  id: null,
  mood: 'neutral',
  energy_level: 5,
  stress_level: 5,
  notes: '',
  noise_level_db: null,
  light_level_lux: null,
  camera_image_data_url: null,
})

const form = ref(createDefaultForm())
const moodEntries = ref([])
const sensorReadings = ref([])
const loading = ref(false)
const saving = ref(false)
const editSaving = ref(false)
const editDialogOpen = ref(false)
const editForm = ref(createDefaultEditForm())
const manualLightValue = ref(null)
const isOffline = ref(typeof navigator !== 'undefined' ? !navigator.onLine : false)
const offlineActionHint = 'Offline: Diese Aktion ist nur mit Internetverbindung verfuegbar.'

const imageDialogOpen = ref(false)
const imageDialogSource = ref('')
const imageDialogTitle = ref('Bildvorschau')

const cameraVideo = ref(null)
const cameraActive = ref(false)
const cameraPhoto = ref(null)
const photoFile = ref(null)
const cameraFacingMode = ref('environment')
let cameraStream = null

const noiseLevel = ref(null)
const noiseActive = ref(false)
let noiseStream = null
let audioContext = null
let analyser = null
let microphoneSource = null
let scriptProcessor = null

const lightSupported = 'AmbientLightSensor' in window
const lightValue = ref(null)
let lightSensor = null

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Date(value).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const moodLabel = (mood) => (moodDesign[mood] ? moodDesign[mood].label : mood)
const moodColor = (mood) => (moodDesign[mood] ? moodDesign[mood].color : 'primary')
const moodIcon = (mood) => (moodDesign[mood] ? moodDesign[mood].icon : 'mood')

const moodAccentStyle = (mood) => ({
  '--entry-accent': moodDesign[mood] ? moodDesign[mood].accent : '#26a69a',
})

const normalizeScore = (value) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return 0
  }
  return Math.max(0, Math.min(parsed, 10)) / 10
}

const formatSensorMetric = (value, unit) => {
  if (value === null || value === undefined || value === '') {
    return 'Kein Wert'
  }

  return `${value} ${unit}`
}

const getRequestErrorText = (error) => {
  const status = error && error.response ? error.response.status : null
  const message = error && error.response && error.response.data && error.response.data.message
    ? error.response.data.message
    : error.message

  return status ? `${message} (HTTP ${status})` : message
}

const handleOfflineStateChange = (nextOffline) => {
  const changed = isOffline.value !== nextOffline
  isOffline.value = nextOffline
  if (!changed) {
    return
  }

  $q.notify({
    type: nextOffline ? 'warning' : 'positive',
    message: nextOffline
      ? 'Keine Internetverbindung. Online-Aktionen wurden deaktiviert.'
      : 'Internetverbindung wiederhergestellt. Online-Aktionen sind wieder verfuegbar.',
  })
}

const handleOnline = () => handleOfflineStateChange(false)
const handleOffline = () => handleOfflineStateChange(true)

const openImagePreview = (entry) => {
  const imageSrc = getEntryImageSrc(entry)
  if (!imageSrc) {
    return
  }

  imageDialogSource.value = imageSrc
  imageDialogTitle.value = `${moodLabel(entry.mood)} - ${formatDate(entry.timestamp)}`
  imageDialogOpen.value = true
}

const cameraFacingModeLabel = () => (cameraFacingMode.value === 'environment' ? 'Hinten' : 'Vorne')

const getMoodEntryIdFromSensor = (sensorRow) => {
  const sensorData = sensorRow && typeof sensorRow.data === 'object' && sensorRow.data !== null
    ? sensorRow.data
    : {}
  const moodEntryId = Number(sensorData.mood_entry_id)
  return Number.isFinite(moodEntryId) ? moodEntryId : null
}

const enrichMoodEntriesWithSensorFallback = (entries, sensors) => {
  const cameraByMoodId = new Map()
  const noiseByMoodId = new Map()
  const lightByMoodId = new Map()

  sensors.forEach((sensorRow) => {
    const moodEntryId = getMoodEntryIdFromSensor(sensorRow)
    if (!moodEntryId) {
      return
    }

    const sensorData = sensorRow && typeof sensorRow.data === 'object' && sensorRow.data !== null
      ? sensorRow.data
      : {}

    if (sensorRow.sensor_type === 'camera' && !cameraByMoodId.has(moodEntryId) && sensorData.image_data_url) {
      cameraByMoodId.set(moodEntryId, sensorData.image_data_url)
    }

    if (sensorRow.sensor_type === 'microphone' && !noiseByMoodId.has(moodEntryId) && sensorData.noise_level_db !== undefined) {
      noiseByMoodId.set(moodEntryId, sensorData.noise_level_db)
    }

    if (sensorRow.sensor_type === 'light' && !lightByMoodId.has(moodEntryId) && sensorData.illuminance !== undefined) {
      lightByMoodId.set(moodEntryId, sensorData.illuminance)
    }
  })

  return entries.map((entry) => {
    const cameraSensorDataUrl = cameraByMoodId.get(entry.id) || null
    return {
      ...entry,
      camera_image_sensor_data_url: cameraSensorDataUrl,
      camera_image_data_url: entry.camera_image_data_url || cameraSensorDataUrl,
      image_broken: false,
      noise_level_db: entry.noise_level_db ?? noiseByMoodId.get(entry.id) ?? null,
      light_level_lux: entry.light_level_lux ?? lightByMoodId.get(entry.id) ?? null,
    }
  })
}

const getEntryImageSrc = (entry) => {
  if (!entry) {
    return null
  }

  const normalizeImageSource = (value) => {
    if (!value || typeof value !== 'string') {
      return null
    }

    const cleanedValue = value.trim()
    if (!cleanedValue) {
      return null
    }

    if (cleanedValue.startsWith('data:image/')) {
      return cleanedValue
    }

    if (/^https?:\/\//i.test(cleanedValue)) {
      return cleanedValue
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    if (cleanedValue.startsWith('/')) {
      return `${origin}${cleanedValue}`
    }

    return `${origin}/${cleanedValue}`
  }

  if (entry.image_broken && entry.camera_image_sensor_data_url) {
    return normalizeImageSource(entry.camera_image_sensor_data_url)
  }

  return normalizeImageSource(entry.camera_image_data_url || entry.camera_image_sensor_data_url || null)
}

const markEntryImageBroken = (entry) => {
  if (!entry) {
    return
  }

  entry.image_broken = true
}

const openEditEntry = (entry) => {
  const previewImage = getEntryImageSrc(entry)
  editForm.value = {
    id: entry.id,
    mood: entry.mood || 'neutral',
    energy_level: Number(entry.energy_level ?? 5),
    stress_level: Number(entry.stress_level ?? 5),
    notes: entry.notes || '',
    noise_level_db: entry.noise_level_db ?? null,
    light_level_lux: entry.light_level_lux ?? null,
    camera_image_data_url: previewImage || null,
  }
  editDialogOpen.value = true
}

const useCurrentCameraPhotoInEdit = () => {
  if (!cameraPhoto.value) {
    $q.notify({
      type: 'warning',
      message: 'Kein aktuelles Kamera-Foto vorhanden.',
    })
    return
  }

  editForm.value.camera_image_data_url = cameraPhoto.value
}

const clearEditPhoto = () => {
  editForm.value.camera_image_data_url = null
}

const applyManualLightValue = () => {
  const parsed = Number(manualLightValue.value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    $q.notify({
      type: 'warning',
      message: 'Bitte einen gueltigen Lux-Wert eingeben.',
    })
    return
  }

  lightValue.value = Math.round(parsed)
  $q.notify({
    type: 'positive',
    message: `Lichtwert manuell gesetzt: ${lightValue.value} lux`,
  })
}

const summarizeSensorReading = (row) => {
  const data = row && typeof row.data === 'object' && row.data !== null ? row.data : {}

  if (row.sensor_type === 'light') {
    return data.illuminance !== undefined ? `${data.illuminance} lux` : 'Lichtwert gespeichert'
  }

  if (row.sensor_type === 'camera') {
    return 'Kamerabild gespeichert'
  }

  if (row.sensor_type === 'microphone') {
    return data.noise_level_db !== undefined ? `${data.noise_level_db} dB` : 'Lautstaerke gespeichert'
  }

  return 'Datensatz gespeichert'
}

const loadData = async () => {
  if (isOffline.value) {
    return
  }

  loading.value = true
  try {
    const [moodResponse, sensorResponse] = await Promise.all([
      api.get('/mood-entries'),
      api.get('/sensor-readings'),
    ])

    const moodRows = Array.isArray(moodResponse.data) ? moodResponse.data : []
    const sensorRows = Array.isArray(sensorResponse.data)
      ? sensorResponse.data.filter((entry) => allowedSensorTypes.includes(entry.sensor_type))
      : []

    sensorReadings.value = sensorRows
    moodEntries.value = enrichMoodEntriesWithSensorFallback(moodRows, sensorRows)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Daten konnten nicht geladen werden: ${getRequestErrorText(error)}`,
    })
  } finally {
    loading.value = false
  }
}

const startCamera = async () => {
  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
    $q.notify({
      type: 'warning',
      message: 'Kamera wird von diesem Browser nicht unterstuetzt.',
    })
    return
  }

  try {
    const preferredCameraConfig = {
      video: { facingMode: { ideal: cameraFacingMode.value } },
      audio: false,
    }

    try {
      cameraStream = await navigator.mediaDevices.getUserMedia(preferredCameraConfig)
    } catch (cameraError) {
      if (cameraError && ['OverconstrainedError', 'NotFoundError'].includes(cameraError.name)) {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      } else {
        throw cameraError
      }
    }

    if (cameraVideo.value) {
      cameraVideo.value.srcObject = cameraStream
      await cameraVideo.value.play()
    }

    cameraActive.value = true
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Kamera konnte nicht gestartet werden: ${error.message}`,
    })
  }
}

const stopCamera = () => {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop())
    cameraStream = null
  }

  if (cameraVideo.value) {
    cameraVideo.value.srcObject = null
  }

  cameraActive.value = false
}

const toggleCamera = async () => {
  if (cameraActive.value) {
    stopCamera()
  } else {
    await startCamera()
  }
}

const rotateCamera = async () => {
  cameraFacingMode.value = cameraFacingMode.value === 'environment' ? 'user' : 'environment'

  if (cameraActive.value) {
    stopCamera()
    await startCamera()
  }
}

const captureCameraPhoto = () => {
  if (!cameraActive.value || !cameraVideo.value) {
    return
  }

  const width = cameraVideo.value.videoWidth || 640
  const height = cameraVideo.value.videoHeight || 480

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  context.drawImage(cameraVideo.value, 0, 0, width, height)
  cameraPhoto.value = canvas.toDataURL('image/jpeg', 0.9)
}

const clearCameraPhoto = () => {
  cameraPhoto.value = null
  photoFile.value = null
}

const onPhotoFilePicked = (file) => {
  if (!file) {
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      cameraPhoto.value = reader.result
      $q.notify({
        type: 'positive',
        message: 'Bilddatei als Foto uebernommen.',
      })
    }
  }
  reader.onerror = () => {
    $q.notify({
      type: 'negative',
      message: 'Bilddatei konnte nicht gelesen werden.',
    })
  }
  reader.readAsDataURL(file)
}

const startNoiseMeasurement = async () => {
  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
    $q.notify({
      type: 'warning',
      message: 'Mikrofon wird von diesem Browser nicht unterstuetzt.',
    })
    return
  }

  try {
    noiseStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    })

    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    analyser = audioContext.createAnalyser()
    microphoneSource = audioContext.createMediaStreamSource(noiseStream)
    scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1)

    analyser.smoothingTimeConstant = 0.3
    analyser.fftSize = 1024

    microphoneSource.connect(analyser)
    analyser.connect(scriptProcessor)
    scriptProcessor.connect(audioContext.destination)

    scriptProcessor.onaudioprocess = () => {
      const values = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(values)
      const average = values.reduce((sum, value) => sum + value, 0) / values.length
      noiseLevel.value = Math.max(0, Math.round(average * 0.5))
    }

    noiseActive.value = true
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Mikrofon konnte nicht gestartet werden: ${error.message}`,
    })
  }
}

const stopNoiseMeasurement = () => {
  if (noiseStream) {
    noiseStream.getTracks().forEach((track) => track.stop())
    noiseStream = null
  }

  if (microphoneSource) {
    microphoneSource.disconnect()
    microphoneSource = null
  }

  if (scriptProcessor) {
    scriptProcessor.disconnect()
    scriptProcessor = null
  }

  if (analyser) {
    analyser.disconnect()
    analyser = null
  }

  if (audioContext) {
    audioContext.close()
    audioContext = null
  }

  noiseActive.value = false
}

const clearNoiseMeasurement = () => {
  noiseLevel.value = null
}

const startLightSensor = () => {
  if (!lightSupported) {
    return
  }

  stopLightSensor()

  try {
    const SensorConstructor = window.AmbientLightSensor
    lightSensor = new SensorConstructor()

    lightSensor.addEventListener('reading', () => {
      lightValue.value = Math.round(lightSensor.illuminance)
    })

    lightSensor.addEventListener('error', (event) => {
      $q.notify({
        type: 'negative',
        message: `Lichtsensor Fehler: ${event.error.message}`,
      })
      stopLightSensor()
    })

    lightSensor.start()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Lichtsensor konnte nicht gestartet werden: ${error.message}`,
    })
  }
}

const stopLightSensor = () => {
  if (lightSensor) {
    lightSensor.stop()
    lightSensor = null
  }
}

const buildMoodPayload = () => ({
  mood: form.value.mood,
  energy_level: Number(form.value.energy_level),
  stress_level: Number(form.value.stress_level),
  notes: form.value.notes || '',
  weather_conditions: 'sensor_mode',
  activity: 'sensor_capture',
  latitude: 0,
  longitude: 0,
  noise_level_db: noiseLevel.value !== null ? Number(noiseLevel.value) : null,
  light_level_lux: lightValue.value !== null ? Number(lightValue.value) : null,
  camera_image_data_url: cameraPhoto.value,
})

const isMoodPayloadValid = (payload) => payload.energy_level >= 1
  && payload.energy_level <= 10
  && payload.stress_level >= 1
  && payload.stress_level <= 10

const resetFormAndSensors = () => {
  form.value = createDefaultForm()
  clearCameraPhoto()
  clearNoiseMeasurement()
  lightValue.value = null
  manualLightValue.value = null
  stopCamera()
  stopNoiseMeasurement()
  stopLightSensor()
}

const buildEditPayload = () => ({
  mood: editForm.value.mood,
  energy_level: Number(editForm.value.energy_level),
  stress_level: Number(editForm.value.stress_level),
  notes: editForm.value.notes || '',
  weather_conditions: 'sensor_mode',
  activity: 'sensor_capture',
  latitude: 0,
  longitude: 0,
  noise_level_db: editForm.value.noise_level_db === '' ? null : editForm.value.noise_level_db,
  light_level_lux: editForm.value.light_level_lux === '' ? null : editForm.value.light_level_lux,
  camera_image_data_url: editForm.value.camera_image_data_url || null,
})

const saveEditEntry = async () => {
  if (isOffline.value) {
    $q.notify({
      type: 'warning',
      message: offlineActionHint,
    })
    return
  }

  if (!editForm.value.id) {
    return
  }

  const payload = buildEditPayload()
  if (!isMoodPayloadValid(payload)) {
    $q.notify({
      type: 'warning',
      message: 'Energie und Stress muessen zwischen 1 und 10 liegen.',
    })
    return
  }

  if (payload.noise_level_db !== null && Number(payload.noise_level_db) < 0) {
    $q.notify({
      type: 'warning',
      message: 'Lautstaerke muss >= 0 sein.',
    })
    return
  }

  if (payload.light_level_lux !== null && Number(payload.light_level_lux) < 0) {
    $q.notify({
      type: 'warning',
      message: 'Lichtwert muss >= 0 sein.',
    })
    return
  }

  editSaving.value = true
  try {
    await api.put(`/mood-entries/${editForm.value.id}`, payload)
    $q.notify({
      type: 'positive',
      message: 'Eintrag aktualisiert.',
    })
    editDialogOpen.value = false
    editForm.value = createDefaultEditForm()
    await loadData()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Aktualisierung fehlgeschlagen: ${getRequestErrorText(error)}`,
    })
  } finally {
    editSaving.value = false
  }
}

const deleteEntry = async (entry) => {
  if (isOffline.value) {
    $q.notify({
      type: 'warning',
      message: offlineActionHint,
    })
    return
  }

  const isConfirmed = window.confirm(`Soll Eintrag #${entry.id} wirklich geloescht werden?`)
  if (!isConfirmed) {
    return
  }

  try {
    await api.delete(`/mood-entries/${entry.id}`)
    $q.notify({
      type: 'positive',
      message: 'Eintrag geloescht.',
    })
    await loadData()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Loeschen fehlgeschlagen: ${getRequestErrorText(error)}`,
    })
  }
}

const saveDataset = async () => {
  if (isOffline.value) {
    $q.notify({
      type: 'warning',
      message: offlineActionHint,
    })
    return
  }

  const moodPayload = buildMoodPayload()
  if (!isMoodPayloadValid(moodPayload)) {
    $q.notify({
      type: 'warning',
      message: 'Energie und Stress muessen zwischen 1 und 10 liegen.',
    })
    return
  }

  if (!cameraPhoto.value) {
    $q.notify({
      type: 'warning',
      message: 'Bitte zuerst ein Foto mit der Live-Kamera aufnehmen.',
    })
    return
  }

  if (noiseLevel.value === null) {
    $q.notify({
      type: 'warning',
      message: 'Bitte zuerst die Umgebungslautstaerke in dB messen.',
    })
    return
  }

  if (lightValue.value === null) {
    $q.notify({
      type: 'warning',
      message: 'Bitte einen Lichtwert erfassen (Sensor oder manuell).',
    })
    return
  }

  saving.value = true
  try {
    const moodResponse = await api.post('/mood-entries', moodPayload)
    const moodEntryId = moodResponse.data && moodResponse.data.id ? moodResponse.data.id : null
    const sensorRequests = []

    sensorRequests.push(
      api.post('/sensor-readings', {
        sensor_type: 'camera',
        data: {
          mood_entry_id: moodEntryId,
          image_data_url: cameraPhoto.value,
        },
      }),
    )

    sensorRequests.push(
      api.post('/sensor-readings', {
        sensor_type: 'microphone',
        data: {
          mood_entry_id: moodEntryId,
          noise_level_db: noiseLevel.value,
        },
      }),
    )

    sensorRequests.push(
      api.post('/sensor-readings', {
        sensor_type: 'light',
        data: {
          mood_entry_id: moodEntryId,
          illuminance: lightValue.value,
        },
      }),
    )

    await Promise.all(sensorRequests)

    $q.notify({
      type: 'positive',
      message: 'Datensatz gespeichert.',
    })

    resetFormAndSensors()
    await loadData()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Speichern fehlgeschlagen: ${getRequestErrorText(error)}`,
    })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  window.addEventListener('offline', handleOffline)
  window.addEventListener('online', handleOnline)

  await loadData()
})

onUnmounted(() => {
  window.removeEventListener('offline', handleOffline)
  window.removeEventListener('online', handleOnline)
  stopCamera()
  stopNoiseMeasurement()
  stopLightSensor()
})
</script>

<style scoped>
.entry-page {
  max-width: 1280px;
  margin: 0 auto;
  background:
    radial-gradient(circle at 10% 10%, rgba(38, 166, 154, 0.08), transparent 40%),
    radial-gradient(circle at 95% 90%, rgba(30, 136, 229, 0.08), transparent 35%);
}

.hero {
  padding: 8px 4px;
}

.offline-banner {
  border: 1px solid rgba(255, 193, 7, 0.4);
  background: linear-gradient(180deg, rgba(255, 248, 225, 0.95), rgba(255, 243, 205, 0.95));
  color: #6d4c00;
}

.capture-card,
.mood-wall-card,
.sensor-history-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);
}

.sensor-card {
  border-radius: 14px;
}

.camera-video,
.camera-preview {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #000;
}

.mood-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.mood-entry-card {
  border-radius: 14px;
  overflow: hidden;
  border-top: 4px solid var(--entry-accent, #26a69a);
}

.mood-entry-image {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #eceff1;
}

.mood-entry-image-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.mood-entry-image--placeholder {
  min-height: 170px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: linear-gradient(140deg, #eceff1 0%, #cfd8dc 100%);
  color: #546e7a;
}

.entry-image-overlay {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.65));
}

.entry-time {
  font-size: 12px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.metric-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.metric-chip--energy {
  background: rgba(76, 175, 80, 0.14);
  color: #2e7d32;
}

.metric-chip--stress {
  background: rgba(244, 67, 54, 0.14);
  color: #c62828;
}

.bar-label {
  font-size: 12px;
  margin-bottom: 4px;
  color: #455a64;
}

.sensor-chip {
  width: 100%;
  justify-content: center;
}

.notes-box {
  border-radius: 10px;
  border: 1px dashed rgba(69, 90, 100, 0.35);
  padding: 8px 10px;
  min-height: 62px;
}

.mood-empty-state {
  text-align: center;
  padding: 40px 16px;
  color: #546e7a;
}

.image-dialog-card {
  background: #101418;
  color: #fff;
}

.edit-dialog-card {
  width: min(92vw, 860px);
  max-width: 860px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.14);
}

.edit-dialog-header {
  padding: 16px 20px 12px;
  background: linear-gradient(180deg, rgba(38, 166, 154, 0.08), rgba(38, 166, 154, 0));
}

.edit-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 20px;
  max-height: min(72vh, 760px);
  overflow-y: auto;
}

.edit-photo-block {
  border: 1px solid #d9e3e7;
  border-radius: 12px;
  padding: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(247, 250, 252, 0.95));
}

.edit-image-preview {
  width: 100%;
  min-height: 170px;
  max-height: 300px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #d9e3e7;
  background: #f2f5f7;
}

.edit-image-empty {
  min-height: 130px;
  border: 1px dashed rgba(69, 90, 100, 0.35);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #607d8b;
  background: #fff;
  font-size: 14px;
}

.edit-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px 16px;
}

.action-with-tooltip {
  display: inline-flex;
}

.dialog-image-wrapper {
  height: calc(100vh - 42px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.dialog-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 10px;
}

@media (max-width: 768px) {
  .entry-page {
    padding: 8px;
  }

  .edit-dialog-card {
    width: 96vw;
    border-radius: 12px;
  }

  .edit-dialog-header {
    padding: 12px 14px 10px;
  }

  .edit-dialog-body {
    padding: 12px 14px;
    max-height: 78vh;
  }

  .edit-dialog-actions {
    padding: 10px 14px 14px;
    flex-wrap: wrap;
  }

  .edit-dialog-actions .q-btn {
    flex: 1 1 100%;
  }
}
</style>
