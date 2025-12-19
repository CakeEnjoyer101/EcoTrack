<template>
  <q-page class="dashboard-page">
    <div class="q-pa-md">
      <!-- Logo und Titelbereich -->
      <div class="row items-center q-mb-lg">
        <div class="col-auto">
          <q-avatar size="60px" class="q-mr-md">
            <img src="/icons/EcoTrack-logo.png" alt="EcoTrack Logo">
          </q-avatar>
        </div>
        <div class="col">
          <h4 class="text-h4 q-mb-none">EcoTrack Dashboard</h4>
          <div class="text-subtitle1 text-grey">Umweltdaten Übersicht - HTL Wien West</div>
        </div>
        <div class="col-auto">
          <q-btn
            flat
            round
            icon="refresh"
            @click="refreshData"
            class="text-primary"
          />
          <q-btn
            flat
            round
            icon="info"
            @click="showWorkboxStatus = true"
            class="text-secondary q-ml-sm"
          />
        </div>
      </div>

      <!-- Daten und Status Row -->
      <div class="row q-col-gutter-md q-mb-lg">
        <!-- Aktuelle Werte Cards (für Mobile/Portrait) -->
        <div class="col-12" v-if="$q.screen.lt.md">
          <div class="row q-col-gutter-sm">
            <div class="col-6" v-for="stat in quickStats" :key="stat.title">
              <q-card class="stat-card">
                <q-card-section class="text-center">
                  <div class="text-h6">{{ stat.value }}</div>
                  <div class="text-caption">{{ stat.title }}</div>
                  <q-badge :color="stat.color" class="q-mt-xs">
                    {{ stat.trend }}
                  </q-badge>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Desktop Quick Stats (für Landscape) -->
        <div class="col-12" v-if="$q.screen.gt.sm">
          <q-card>
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <h5 class="text-h5 q-mb-none">📊 Aktuelle Werte</h5>
                </div>
                <div class="col-auto">
                  <q-btn flat dense icon="schedule" color="primary">
                    {{ currentTime }}
                  </q-btn>
                </div>
              </div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <div class="row q-col-gutter-md">
                <div class="col-3" v-for="stat in quickStats" :key="stat.title">
                  <div class="text-center">
                    <div class="text-h4 text-primary">{{ stat.value }}</div>
                    <div class="text-caption">{{ stat.title }}</div>
                    <q-linear-progress
                      :value="stat.progress"
                      :color="stat.color"
                      class="q-mt-sm"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Haupt Tabelle/Timetable (für Landscape) -->
      <div class="q-mb-lg" v-if="$q.screen.gt.sm">
        <q-card>
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <h5 class="text-h5 q-mb-none">⏰ Messungs-Timetable</h5>
                <div class="text-caption">Letzte 24 Stunden - Umweltdaten</div>
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  color="primary"
                  icon="today"
                  label="Heute"
                  @click="filterToday"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <!-- Timetable Table -->
            <q-table
              flat
              bordered
              :rows="timeTableData"
              :columns="timeTableColumns"
              row-key="id"
              :pagination="pagination"
              class="timetable-table"
            >
              <!-- Custom Header -->
              <template v-slot:header="props">
                <q-tr :props="props" class="bg-primary text-white">
                  <q-th v-for="col in props.cols" :key="col.name" :props="props">
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <!-- Custom Row für Status -->
              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-badge :color="getStatusColor(props.row.status)" class="q-pa-xs">
                    {{ props.row.status }}
                  </q-badge>
                </q-td>
              </template>

              <!-- Custom Row für Messung -->
              <template v-slot:body-cell-measurement="props">
                <q-td :props="props">
                  <div class="row items-center">
                    <div class="col">
                      {{ props.row.measurement }}
                      <span class="text-caption">{{ props.row.unit }}</span>
                    </div>
                    <div class="col-auto">
                      <q-icon
                        :name="getTrendIcon(props.row.trend)"
                        :color="getTrendColor(props.row.trend)"
                        size="sm"
                      />
                    </div>
                  </div>
                </q-td>
              </template>

              <!-- Custom Row für Aktionen -->
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    dense
                    round
                    icon="visibility"
                    color="primary"
                    size="sm"
                    @click="viewDetails(props.row)"
                  />
                  <q-btn
                    flat
                    dense
                    round
                    icon="trending_up"
                    color="secondary"
                    size="sm"
                    class="q-ml-xs"
                    @click="showTrend(props.row)"
                  />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- Mobile/Portrait Ansicht (Card-Ansicht) -->
      <div class="q-mb-lg" v-if="$q.screen.lt.md">
        <q-card>
          <q-card-section>
            <h5 class="text-h5 q-mb-md">📅 Heutige Messungen</h5>

            <div class="timeline-view">
              <div v-for="item in timeTableData" :key="item.id" class="timeline-item q-mb-md">
                <q-card bordered flat>
                  <q-card-section>
                    <div class="row items-center">
                      <div class="col-auto">
                        <q-avatar :color="getTypeColor(item.type)" text-color="white" size="lg">
                          {{ getTypeIcon(item.type) }}
                        </q-avatar>
                      </div>
                      <div class="col q-pl-md">
                        <div class="text-weight-bold">{{ item.group }}</div>
                        <div class="text-caption">{{ item.start }} - {{ item.duration }} min</div>
                      </div>
                      <div class="col-auto">
                        <div class="text-h5">{{ item.measurement }}</div>
                        <div class="text-caption text-right">{{ item.unit }}</div>
                      </div>
                    </div>

                    <div class="row q-mt-sm">
                      <div class="col">
                        <q-badge :color="getStatusColor(item.status)" class="q-pa-xs">
                          {{ item.status }}
                        </q-badge>
                      </div>
                      <div class="col-auto">
                        <q-icon
                          :name="getTrendIcon(item.trend)"
                          :color="getTrendColor(item.trend)"
                          size="sm"
                        />
                        <span class="text-caption q-ml-xs">{{ getTrendText(item.trend) }}</span>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Service Worker Status Dialog -->
      <q-dialog v-model="showWorkboxStatus">
        <q-card style="width: 500px; max-width: 80vw;">
          <q-card-section>
            <div class="text-h6">Service Worker Status</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="q-gutter-y-md">
              <div class="text-body1">
                <strong>Workbox Service Worker:</strong>
                <q-badge color="positive" class="q-ml-sm">Aktiv</q-badge>
              </div>
              <div class="text-caption">
                Version: {{ workboxVersion }}
              </div>
              <q-separator />
              <div class="text-body2">
                Die App wird aus dem Cache durch einen Service Worker geliefert.
              </div>
              <div class="text-caption text-grey">
                Für mehr Details besuchen Sie: https://goo.gl/AFskqB
              </div>
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
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// State
const showWorkboxStatus = ref(false)
const workboxVersion = ref('6.5.4')
const currentTime = ref('')

// Timetable Daten
const timeTableData = ref([
  {
    id: 1,
    group: 'v01',
    start: '06:00',
    duration: 10,
    measurement: 80,
    unit: 'dB',
    type: 'noise',
    status: 'Normal',
    trend: 'up'
  },
  {
    id: 2,
    group: 'v02',
    start: '06:11',
    duration: 10,
    measurement: 180,
    unit: 'lux',
    type: 'light',
    status: 'Hoch',
    trend: 'up'
  },
  {
    id: 3,
    group: 'v03',
    start: '06:22',
    duration: 10,
    measurement: 30,
    unit: 'dB',
    type: 'noise',
    status: 'Niedrig',
    trend: 'down'
  },
  {
    id: 4,
    group: 'v04',
    start: '06:33',
    duration: 10,
    measurement: 180,
    unit: 'lux',
    type: 'light',
    status: 'Hoch',
    trend: 'stable'
  },
  {
    id: 5,
    group: 'v05',
    start: '07:15',
    duration: 15,
    measurement: 65,
    unit: '%',
    type: 'humidity',
    status: 'Normal',
    trend: 'stable'
  },
  {
    id: 6,
    group: 'v06',
    start: '08:30',
    duration: 20,
    measurement: 22,
    unit: '°C',
    type: 'temperature',
    status: 'Optimal',
    trend: 'up'
  },
  {
    id: 7,
    group: 'v07',
    start: '09:45',
    duration: 12,
    measurement: 75,
    unit: 'dB',
    type: 'noise',
    status: 'Erhöht',
    trend: 'up'
  },
  {
    id: 8,
    group: 'v08',
    start: '10:20',
    duration: 8,
    measurement: 350,
    unit: 'lux',
    type: 'light',
    status: 'Normal',
    trend: 'down'
  }
])

// Timetable Columns (für Desktop/Landscape)
const timeTableColumns = [
  {
    name: 'group',
    required: true,
    label: 'Gruppe',
    align: 'center',
    field: row => row.group,
    sortable: true
  },
  {
    name: 'start',
    label: 'Start',
    align: 'center',
    field: row => row.start,
    sortable: true
  },
  {
    name: 'duration',
    label: 'Dauer (min)',
    align: 'center',
    field: row => row.duration,
    sortable: true
  },
  {
    name: 'measurement',
    label: 'Messung',
    align: 'center',
    field: row => row.measurement,
    sortable: true
  },
  {
    name: 'type',
    label: 'Typ',
    align: 'center',
    field: row => getTypeLabel(row.type),
    sortable: true
  },
  {
    name: 'status',
    label: 'Status',
    align: 'center',
    field: row => row.status,
    sortable: true
  },
  {
    name: 'trend',
    label: 'Trend',
    align: 'center',
    field: row => getTrendText(row.trend),
    sortable: true
  },
  {
    name: 'actions',
    label: 'Aktionen',
    align: 'center'
  }
]

// Pagination für Tabelle
const pagination = ref({
  sortBy: 'start',
  descending: false,
  page: 1,
  rowsPerPage: 10
})

// Quick Stats
const quickStats = computed(() => [
  {
    title: 'Lautstärke',
    value: '68 dB',
    color: 'primary',
    trend: '+2%',
    progress: 0.68
  },
  {
    title: 'Licht',
    value: '240 lux',
    color: 'secondary',
    trend: '+5%',
    progress: 0.24
  },
  {
    title: 'Temperatur',
    value: '22°C',
    color: 'positive',
    trend: 'Stabil',
    progress: 0.6
  },
  {
    title: 'Feuchtigkeit',
    value: '65%',
    color: 'info',
    trend: '-3%',
    progress: 0.65
  }
])

// ========== FUNCTIONS ==========

// Workbox Console Log
const logWorkboxToConsole = () => {
  console.log('=== ECOTRACK WORKBOX STATUS ===')
  console.log('App is being served from cache by a service worker.')
  console.log('For more details visit https://goo.gl/AFskqB')
  console.log('Service worker has been registered.')
  console.log('Fetch finished loading: GET "http://localhost:5000/service-worker.js".')
  console.log('Workbox Version:', workboxVersion.value)
  console.log('Timestamp:', new Date().toLocaleString())
  console.log('=== ENDE WORKBOX STATUS ===')

  $q.notify({
    type: 'positive',
    message: 'Workbox Status in Console geloggt'
  })
}

// Helper Functions
const getTypeLabel = (type) => {
  const labels = {
    noise: 'Lautstärke',
    light: 'Licht',
    temperature: 'Temperatur',
    humidity: 'Feuchtigkeit'
  }
  return labels[type] || type
}

const getTypeIcon = (type) => {
  const icons = {
    noise: '🔊',
    light: '💡',
    temperature: '🌡️',
    humidity: '💧'
  }
  return icons[type] || '📊'
}

const getTypeColor = (type) => {
  const colors = {
    noise: 'blue',
    light: 'orange',
    temperature: 'red',
    humidity: 'cyan'
  }
  return colors[type] || 'grey'
}

const getStatusColor = (status) => {
  const colors = {
    'Normal': 'positive',
    'Optimal': 'positive',
    'Hoch': 'warning',
    'Erhöht': 'warning',
    'Niedrig': 'info',
    'Kritisch': 'negative'
  }
  return colors[status] || 'grey'
}

const getTrendIcon = (trend) => {
  const icons = {
    up: 'arrow_upward',
    down: 'arrow_downward',
    stable: 'remove'
  }
  return icons[trend] || 'trending_flat'
}

const getTrendColor = (trend) => {
  const colors = {
    up: 'positive',
    down: 'negative',
    stable: 'info'
  }
  return colors[trend] || 'grey'
}

const getTrendText = (trend) => {
  const texts = {
    up: 'Steigend',
    down: 'Fallend',
    stable: 'Stabil'
  }
  return texts[trend] || 'Unbekannt'
}

// Actions
const refreshData = () => {
  $q.notify({
    type: 'info',
    message: 'Daten werden aktualisiert...'
  })

  // Simulate data refresh
  setTimeout(() => {
    $q.notify({
      type: 'positive',
      message: 'Daten aktualisiert!'
    })
  }, 1000)
}

const filterToday = () => {
  $q.notify({
    type: 'info',
    message: 'Zeige heutige Messungen'
  })
}

const viewDetails = (row) => {
  $q.notify({
    type: 'info',
    message: `Details für ${row.group} anzeigen`
  })
}

const showTrend = (row) => {
  $q.notify({
    type: 'info',
    message: `Trendanalyse für ${row.group}`
  })
}

// Update current time
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  updateTime()
  setInterval(updateTime, 60000) // Update every minute

  // Log Workbox status on load
  setTimeout(() => {
    console.log('✅ App is being served from cache by a service worker.')
    console.log('📦 For more details visit https://goo.gl/AFskqB')
  }, 1000)
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
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.timetable-table {
  border-radius: 8px;
  overflow: hidden;
}

.timetable-table .q-table__top {
  background: linear-gradient(135deg, #26A69A 0%, #00796B 100%);
  color: white;
}

.timeline-view .timeline-item {
  position: relative;
}

.timeline-view .timeline-item::before {
  content: '';
  position: absolute;
  left: 24px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #26A69A;
  opacity: 0.3;
}

.timeline-view .timeline-item:last-child::before {
  display: none;
}

.text-h4 {
  color: #26A69A;
  font-weight: 700;
  font-family: 'Roboto', sans-serif;
}

.text-h5 {
  color: #1976D2;
  font-weight: 600;
  font-family: 'Roboto', sans-serif;
}

.bg-primary {
  background: linear-gradient(135deg, #26A69A 0%, #00796B 100%) !important;
}

.text-primary {
  color: #26A69A !important;
}

.text-secondary {
  color: #1976D2 !important;
}

.q-btn--primary {
  background-color: #26A69A !important;
  color: white !important;
}

.q-btn--secondary {
  background-color: #1976D2 !important;
  color: white !important;
}

/* Responsive Table Styles */
@media (max-width: 768px) {
  .dashboard-page {
    padding: 8px;
  }

  .text-h4 {
    font-size: 1.5rem;
  }
}
</style>