<template>
  <q-page class="dashboard-page">
    <div class="q-pa-md">
      <div class="row items-center q-mb-lg">
        <div class="col-auto">
          <q-avatar size="60px" class="q-mr-md">
            <img src="/icons/EcoTrack-logo.png" alt="EcoTrack Logo" />
          </q-avatar>
        </div>
        <div class="col">
          <h4 class="text-h4 q-mb-none">EcoTrack Dashboard</h4>
          <div class="text-subtitle1 text-grey">Umweltdaten Übersicht - HTL Wien West</div>
        </div>
        <div class="col-auto row items-center q-gutter-sm">
          <q-btn flat round icon="refresh" class="text-primary" @click="refreshData" :loading="loading" />
          <q-btn flat round icon="info" class="text-secondary" @click="showWorkboxStatus = true" />
        </div>
      </div>

      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-lg-3" v-for="stat in quickStats" :key="stat.title">
          <q-card class="stat-card">
            <q-card-section class="text-center">
              <div class="text-h5 text-primary">{{ stat.value }}</div>
              <div class="text-subtitle2">{{ stat.title }}</div>
              <div class="text-caption text-grey-7">{{ stat.subtitle }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-lg-5">
          <q-card>
            <q-card-section>
              <div class="text-h6">Stimmungseintrag erstellen</div>
              <div class="text-caption text-grey-7">Eintrag wird direkt in der Datenbank gespeichert</div>
            </q-card-section>

            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-select
                    v-model="moodForm.mood"
                    :options="moodOptions"
                    emit-value
                    map-options
                    label="Stimmung"
                    outlined
                  />
                </div>

                <div class="col-12 col-sm-6">
                  <q-input
                    v-model.number="moodForm.energy_level"
                    type="number"
                    min="1"
                    max="10"
                    label="Energie (1-10)"
                    outlined
                  />
                </div>

                <div class="col-12 col-sm-6">
                  <q-input
                    v-model.number="moodForm.stress_level"
                    type="number"
                    min="1"
                    max="10"
                    label="Stress (1-10)"
                    outlined
                  />
                </div>

                <div class="col-12">
                  <q-input v-model="moodForm.notes" label="Notizen" outlined />
                </div>

                <div class="col-12 col-sm-6">
                  <q-input v-model="moodForm.weather_conditions" label="Wetterbedingungen" outlined />
                </div>

                <div class="col-12 col-sm-6">
                  <q-input v-model="moodForm.activity" label="Aktivität" outlined />
                </div>

                <div class="col-12 col-sm-6">
                  <q-input v-model.number="moodForm.latitude" type="number" label="Breitengrad (optional)" outlined />
                </div>

                <div class="col-12 col-sm-6">
                  <q-input v-model.number="moodForm.longitude" type="number" label="Längengrad (optional)" outlined />
                </div>
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat color="grey-8" label="Zurücksetzen" @click="resetForm" />
              <q-btn color="primary" label="Eintrag speichern" :loading="saving" @click="createMoodEntry" />
            </q-card-actions>
          </q-card>
        </div>

        <div class="col-12 col-lg-7">
          <q-card>
            <q-card-section class="row items-center">
              <div class="col">
                <div class="text-h6">Letzte Stimmungseinträge</div>
                <div class="text-caption text-grey-7">Aktualisiert um {{ currentTime }}</div>
              </div>
              <div class="col-auto">
                <q-btn flat dense icon="refresh" color="primary" @click="loadData" :loading="loading" />
              </div>
            </q-card-section>

            <q-table
              flat
              bordered
              :rows="moodEntries"
              :columns="entryColumns"
              row-key="id"
              :rows-per-page-options="[5, 10, 20]"
              :loading="loading"
            >
              <template #body-cell-mood="props">
                <q-td :props="props">
                  <q-badge :color="getMoodColor(props.row.mood)">{{ getMoodText(props.row.mood) }}</q-badge>
                </q-td>
              </template>

              <template #body-cell-timestamp="props">
                <q-td :props="props">{{ formatDate(props.row.timestamp) }}</q-td>
              </template>
            </q-table>
          </q-card>
        </div>
      </div>

      <q-dialog v-model="showWorkboxStatus">
        <q-card style="width: 500px; max-width: 85vw">
          <q-card-section>
            <div class="text-h6">Service Worker Status</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="q-gutter-y-md">
              <div class="text-body1">
                <strong>Workbox Service Worker:</strong>
                <q-badge color="positive" class="q-ml-sm">Aktiv</q-badge>
              </div>
              <div class="text-caption">Version: {{ workboxVersion }}</div>
              <q-separator />
              <div class="text-body2">Die App wird aus dem Cache über einen Service Worker ausgeliefert.</div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Console Log" color="secondary" @click="logWorkboxToConsole" />
            <q-btn flat label="Schließen" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()

const showWorkboxStatus = ref(false)
const workboxVersion = ref('6.5.4')
const currentTime = ref('')
const loading = ref(false)
const saving = ref(false)

const moodEntries = ref([])
const sensorReadings = ref([])

const moodOptions = [
  { label: 'Sehr gut', value: 'sehr_gut' },
  { label: 'Gut', value: 'gut' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Schlecht', value: 'schlecht' },
  { label: 'Sehr schlecht', value: 'sehr_schlecht' },
]

const createDefaultForm = () => ({
  mood: 'neutral',
  energy_level: 5,
  stress_level: 5,
  notes: '',
  weather_conditions: 'unknown',
  activity: '',
  latitude: null,
  longitude: null,
})

const moodForm = ref(createDefaultForm())

const entryColumns = [
  { name: 'timestamp', label: 'Zeitpunkt', align: 'left', field: 'timestamp', sortable: true },
  { name: 'mood', label: 'Stimmung', align: 'left', field: 'mood', sortable: true },
  { name: 'energy_level', label: 'Energie', align: 'center', field: 'energy_level', sortable: true },
  { name: 'stress_level', label: 'Stress', align: 'center', field: 'stress_level', sortable: true },
  { name: 'notes', label: 'Notizen', align: 'left', field: 'notes' },
]

const quickStats = computed(() => {
  const moodCount = moodEntries.value.length
  const sensorCount = sensorReadings.value.length
  const avgEnergy = moodCount > 0
    ? (moodEntries.value.reduce((sum, e) => sum + Number(e.energy_level || 0), 0) / moodCount).toFixed(1)
    : '0.0'
  const avgStress = moodCount > 0
    ? (moodEntries.value.reduce((sum, e) => sum + Number(e.stress_level || 0), 0) / moodCount).toFixed(1)
    : '0.0'

  return [
    { title: 'Stimmungseinträge', value: moodCount, subtitle: 'gespeicherte Einträge' },
    { title: 'Sensordaten', value: sensorCount, subtitle: 'gespeicherte Messungen' },
    { title: 'Ø Energie', value: `${avgEnergy}/10`, subtitle: 'Durchschnitt aller Einträge' },
    { title: 'Ø Stress', value: `${avgStress}/10`, subtitle: 'Durchschnitt aller Einträge' },
  ]
})

const updateCurrentTime = () => {
  currentTime.value = new Date().toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getMoodColor = (mood) => {
  const colorMap = {
    sehr_gut: 'positive',
    gut: 'primary',
    neutral: 'warning',
    schlecht: 'negative',
    sehr_schlecht: 'deep-orange',
  }
  return colorMap[mood] || 'grey'
}

const getMoodText = (mood) => {
  const textMap = {
    sehr_gut: 'Sehr gut',
    gut: 'Gut',
    neutral: 'Neutral',
    schlecht: 'Schlecht',
    sehr_schlecht: 'Sehr schlecht',
  }
  return textMap[mood] || mood
}

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

const normalizeFormPayload = () => ({
  mood: moodForm.value.mood,
  energy_level: Number(moodForm.value.energy_level),
  stress_level: Number(moodForm.value.stress_level),
  notes: moodForm.value.notes || '',
  weather_conditions: moodForm.value.weather_conditions || 'unknown',
  activity: moodForm.value.activity || '',
  latitude: moodForm.value.latitude === '' || moodForm.value.latitude === null ? null : Number(moodForm.value.latitude),
  longitude: moodForm.value.longitude === '' || moodForm.value.longitude === null ? null : Number(moodForm.value.longitude),
})

const loadData = async () => {
  loading.value = true
  try {
    const [moodRes, sensorRes] = await Promise.all([
      api.get('/mood-entries'),
      api.get('/sensor-readings'),
    ])

    moodEntries.value = Array.isArray(moodRes.data) ? moodRes.data : []
    sensorReadings.value = Array.isArray(sensorRes.data) ? sensorRes.data : []
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Daten konnten nicht geladen werden: ${error.message}`,
    })
  } finally {
    loading.value = false
  }
}

const createMoodEntry = async () => {
  const payload = normalizeFormPayload()
  if (payload.energy_level < 1 || payload.energy_level > 10 || payload.stress_level < 1 || payload.stress_level > 10) {
    $q.notify({
      type: 'warning',
      message: 'Energie und Stress müssen zwischen 1 und 10 liegen.',
    })
    return
  }

  saving.value = true
  try {
    await api.post('/mood-entries', payload)
    $q.notify({
      type: 'positive',
      message: 'Stimmungseintrag gespeichert.',
    })
    moodForm.value = createDefaultForm()
    await loadData()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Speichern fehlgeschlagen: ${error.message}`,
    })
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  moodForm.value = createDefaultForm()
}

const refreshData = async () => {
  await loadData()
  $q.notify({
    type: 'info',
    message: 'Daten aktualisiert.',
  })
}

const logWorkboxToConsole = () => {
  console.log('=== ECOTRACK WORKBOX STATUS ===')
  console.log('App is being served from cache by a service worker.')
  console.log('Workbox Version:', workboxVersion.value)
  console.log('Timestamp:', new Date().toLocaleString())
  console.log('=== ENDE WORKBOX STATUS ===')

  $q.notify({
    type: 'positive',
    message: 'Workbox-Status wurde in die Konsole geschrieben.',
  })
}

onMounted(async () => {
  updateCurrentTime()
  setInterval(updateCurrentTime, 60000)
  await loadData()
})
</script>

<style scoped>
.dashboard-page {
  max-width: 1400px;
  margin: 0 auto;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.text-h4 {
  color: #26a69a;
  font-weight: 700;
}

.text-primary {
  color: #26a69a !important;
}

.text-secondary {
  color: #1976d2 !important;
}
</style>
