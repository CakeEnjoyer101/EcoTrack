<template>
  <q-page class="q-pa-md">
    <!-- Welcome Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h1 class="text-h4 text-primary text-weight-bold q-mb-none">
          Willkommen bei EcoTrack
        </h1>
        <p class="text-subtitle1 text-grey-7">
          Tracke wie deine Umgebung dein Wohlbefinden beeinflusst
        </p>
      </div>
      <div class="col-auto">
        <q-avatar size="60px" class="bg-primary text-white">
          <q-icon name="eco" size="30px" />
        </q-avatar>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-primary text-white">
          <q-card-section class="text-center">
            <div class="text-h5">{{ moodEntriesCount }}</div>
            <div class="text-subtitle2">Stimmungseinträge</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-secondary text-white">
          <q-card-section class="text-center">
            <div class="text-h5">{{ sensorReadingsCount }}</div>
            <div class="text-subtitle2">Sensordaten</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-accent text-white">
          <q-card-section class="text-center">
            <div class="text-h5">{{ avgEnergy }}/10</div>
            <div class="text-subtitle2">Durchschn. Energie</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-positive text-white">
          <q-card-section class="text-center">
            <div class="text-h5">{{ avgStress }}/10</div>
            <div class="text-subtitle2">Durchschn. Stress</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card class="cursor-pointer" @click="$router.push('/mood-tracker')">
          <q-card-section class="text-center q-pa-xl">
            <q-icon name="mood" size="xl" color="primary" class="q-mb-md" />
            <div class="text-h6">Stimmung tracken</div>
            <div class="text-grey-7">Erfasse deine aktuelle Stimmung</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card class="cursor-pointer" @click="$router.push('/sensors')">
          <q-card-section class="text-center q-pa-xl">
            <q-icon name="sensors" size="xl" color="secondary" class="q-mb-md" />
            <div class="text-h6">Sensoren starten</div>
            <div class="text-grey-7">Umweltdaten sammeln</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="row q-mt-lg">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Letzte Aktivität</div>
          </q-card-section>
          <q-card-section>
            <q-list separator>
              <q-item v-for="entry in recentEntries" :key="entry.id">
                <q-item-section avatar>
                  <q-avatar :color="getMoodColor(entry.mood)" text-color="white">
                    {{ getMoodIcon(entry.mood) }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ getMoodText(entry.mood) }}</q-item-label>
                  <q-item-label caption>Energie: {{ entry.energy_level }}/10 • Stress: {{ entry.stress_level }}/10</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption>{{ formatDate(entry.timestamp) }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="recentEntries.length === 0">
                <q-item-section class="text-center text-grey-7">
                  Noch keine Aktivität
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'

const moodEntries = ref([])
const sensorReadings = ref([])

const moodEntriesCount = computed(() => moodEntries.value.length)
const sensorReadingsCount = computed(() => sensorReadings.value.length)
const avgEnergy = computed(() => {
  if (moodEntries.value.length === 0) return 0
  const sum = moodEntries.value.reduce((acc, entry) => acc + entry.energy_level, 0)
  return Math.round(sum / moodEntries.value.length)
})
const avgStress = computed(() => {
  if (moodEntries.value.length === 0) return 0
  const sum = moodEntries.value.reduce((acc, entry) => acc + entry.stress_level, 0)
  return Math.round(sum / moodEntries.value.length)
})
const recentEntries = computed(() => moodEntries.value.slice(0, 5))

const loadData = async () => {
  try {
    const [moodResponse, sensorResponse] = await Promise.all([
      api.get('/mood-entries'),
      api.get('/sensor-readings')
    ])
    moodEntries.value = moodResponse.data
    sensorReadings.value = sensorResponse.data
  } catch (error) {
    console.error('Fehler beim Laden:', error)
  }
}

const getMoodColor = (mood) => {
  const colors = {
    'sehr_gut': 'positive',
    'gut': 'primary',
    'neutral': 'warning',
    'schlecht': 'negative',
    'sehr_schlecht': 'deep-orange'
  }
  return colors[mood] || 'grey'
}

const getMoodIcon = (mood) => {
  const icons = {
    'sehr_gut': '😄',
    'gut': '😊',
    'neutral': '😐',
    'schlecht': '😔',
    'sehr_schlecht': '😢'
  }
  return icons[mood] || '❓'
}

const getMoodText = (mood) => {
  const texts = {
    'sehr_gut': 'Sehr gute Stimmung',
    'gut': 'Gute Stimmung',
    'neutral': 'Neutrale Stimmung',
    'schlecht': 'Schlechte Stimmung',
    'sehr_schlecht': 'Sehr schlechte Stimmung'
  }
  return texts[mood] || 'Unbekannte Stimmung'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadData()
})
</script>