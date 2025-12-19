<template>
  <q-page class="sensors-page">
    <div class="q-pa-md">
      <h4 class="text-h4 q-mb-md">Umwelt- & Gesundheitsmonitor</h4>

      <!-- Ambient Light Sensor -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">💡 Umgebungslicht</div>
        </q-card-section>
        <q-card-section>
          <div v-if="ambientLight !== null" class="text-h4">
            {{ ambientLight }} lux
          </div>
          <div v-else class="text-italic">
            Lichtsensor wird initialisiert...
          </div>
          <div class="text-caption">{{ getLightDescription(ambientLight) }}</div>
        </q-card-section>
        <q-card-actions>
          <q-btn
            color="primary"
            label="Lichtsensor starten"
            @click="startLightSensor"
            :disable="lightSensor !== null"
          />
          <q-btn
            v-if="lightSensor"
            color="negative"
            label="Stoppen"
            @click="stopLightSensor"
          />
        </q-card-actions>
      </q-card>

      <!-- Microphone -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">🔊 Umgebungslautstärke</div>
        </q-card-section>
        <q-card-section>
          <div class="text-h4">
            {{ noiseLevel }} dB
          </div>
          <div class="text-caption">{{ getNoiseDescription(noiseLevel) }}</div>
        </q-card-section>
        <q-card-actions>
          <q-btn
            :color="microphoneActive ? 'negative' : 'primary'"
            :label="microphoneActive ? 'Messung stoppen' : 'Lautstärke messen'"
            @click="toggleMicrophone"
          />
        </q-card-actions>
      </q-card>

      <!-- GPS -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">📍 Standort & Höhe</div>
        </q-card-section>
        <q-card-section>
          <div v-if="gpsData.latitude" class="text-body1">
            <div>Breitengrad: {{ gpsData.latitude }}</div>
            <div>Längengrad: {{ gpsData.longitude }}</div>
            <div>Höhe: {{ gpsData.altitude || 'N/A' }}m</div>
            <div>Genauigkeit: {{ gpsData.accuracy }}m</div>
          </div>
          <div v-else class="text-italic">
            Standortdaten werden ermittelt...
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn
            :color="gpsWatchId ? 'negative' : 'primary'"
            :label="gpsWatchId ? 'Standortverfolgung stoppen' : 'Standort ermitteln'"
            @click="toggleGPS"
          />
        </q-card-actions>
      </q-card>

      <!-- Battery -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">🔋 Akkustatus</div>
        </q-card-section>
        <q-card-section>
          <div v-if="batteryData.level !== null" class="text-body1">
            <div>Ladestatus: {{ Math.round(batteryData.level * 100) }}%</div>
            <div>Ladezustand: {{ batteryData.charging ? 'Wird geladen' : 'Nicht am Laden' }}</div>
            <q-linear-progress
              :value="batteryData.level"
              :color="getBatteryColor(batteryData.level)"
              class="q-mt-sm"
            />
          </div>
          <div v-else class="text-italic">
            Batterie-API nicht verfügbar
          </div>
        </q-card-section>
      </q-card>

      <!-- Motion Sensor -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">🔄 Bewegungssensor</div>
        </q-card-section>
        <q-card-section>
          <div v-if="motionData.acceleration" class="text-body1">
            <div>Beschleunigung X: {{ motionData.acceleration.x?.toFixed(2) || 0 }} m/s²</div>
            <div>Beschleunigung Y: {{ motionData.acceleration.y?.toFixed(2) || 0 }} m/s²</div>
            <div>Beschleunigung Z: {{ motionData.acceleration.z?.toFixed(2) || 0 }} m/s²</div>
          </div>
          <div v-else class="text-italic">
            Bewegungssensor wird initialisiert...
          </div>
        </q-card-section>
      </q-card>

      <!-- Orientation Sensor -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">🧭 Orientierung</div>
        </q-card-section>
        <q-card-section>
          <div v-if="orientationData.alpha !== null" class="text-body1">
            <div>Alpha: {{ orientationData.alpha?.toFixed(2) || 0 }}°</div>
            <div>Beta: {{ orientationData.beta?.toFixed(2) || 0 }}°</div>
            <div>Gamma: {{ orientationData.gamma?.toFixed(2) || 0 }}°</div>
          </div>
          <div v-else class="text-italic">
            Orientierungssensor wird initialisiert...
          </div>
        </q-card-section>
      </q-card>

      <!-- Vibration -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">📳 Vibration</div>
        </q-card-section>
        <q-card-actions>
          <q-btn color="primary" label="Kurze Vibration" @click="vibrate(200)" />
          <q-btn color="primary" label="Lange Vibration" @click="vibrate(1000)" />
          <q-btn color="negative" label="Vibration stoppen" @click="stopVibration" />
        </q-card-actions>
      </q-card>

      <!-- Sensor Status -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">📊 Sensor Status</div>
        </q-card-section>
        <q-card-section>
          <q-list dense>
            <q-item>
              <q-item-section>Lichtsensor</q-item-section>
              <q-item-section side>
                <q-badge :color="lightSensor ? 'positive' : 'negative'">
                  {{ lightSensor ? 'Aktiv' : 'Inaktiv' }}
                </q-badge>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Mikrofon</q-item-section>
              <q-item-section side>
                <q-badge :color="microphoneActive ? 'positive' : 'negative'">
                  {{ microphoneActive ? 'Aktiv' : 'Inaktiv' }}
                </q-badge>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>GPS</q-item-section>
              <q-item-section side>
                <q-badge :color="gpsWatchId ? 'positive' : 'negative'">
                  {{ gpsWatchId ? 'Aktiv' : 'Inaktiv' }}
                </q-badge>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Batterie</q-item-section>
              <q-item-section side>
                <q-badge :color="batteryData.level !== null ? 'positive' : 'negative'">
                  {{ batteryData.level !== null ? 'Aktiv' : 'Nicht verfügbar' }}
                </q-badge>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Bewegung</q-item-section>
              <q-item-section side>
                <q-badge :color="motionData.acceleration ? 'positive' : 'negative'">
                  {{ motionData.acceleration ? 'Aktiv' : 'Inaktiv' }}
                </q-badge>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Orientierung</q-item-section>
              <q-item-section side>
                <q-badge :color="orientationData.alpha !== null ? 'positive' : 'negative'">
                  {{ orientationData.alpha !== null ? 'Aktiv' : 'Inaktiv' }}
                </q-badge>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Vibration</q-item-section>
              <q-item-section side>
                <q-badge color="positive">Verfügbar</q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Refs für Sensoren
const ambientLight = ref(null)
const noiseLevel = ref(null)
const microphoneActive = ref(false)
const lightSensor = ref(null)

// GPS
const gpsData = ref({
  latitude: null,
  longitude: null,
  altitude: null,
  accuracy: null
})
const gpsWatchId = ref(null)

// Motion
const motionData = ref({
  acceleration: null
})

// Orientation
const orientationData = ref({
  alpha: null,
  beta: null,
  gamma: null
})

// Battery
const batteryData = ref({
  level: null,
  charging: false
})

// Audio Variablen
let audioContext = null
let analyser = null
let microphone = null
let javascriptNode = null
let mediaStream = null

// ========== AMBIENT LIGHT SENSOR ==========
const startLightSensor = () => {
  if ('AmbientLightSensor' in window) {
    try {
      const AmbientLightSensor = window.AmbientLightSensor
      lightSensor.value = new AmbientLightSensor()

      lightSensor.value.addEventListener('reading', () => {
        ambientLight.value = Math.round(lightSensor.value.illuminance)
      })

      lightSensor.value.addEventListener('error', (event) => {
        console.error('Lichtsensor Fehler:', event.error)
        $q.notify({
          type: 'negative',
          message: 'Lichtsensor Fehler'
        })
        stopLightSensor()
      })

      lightSensor.value.start()
      $q.notify({
        type: 'positive',
        message: 'Lichtsensor gestartet'
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: `Lichtsensor nicht verfügbar: ${error.message}`
      })
    }
  } else {
    $q.notify({
      type: 'warning',
      message: 'AmbientLightSensor API nicht unterstützt'
    })
  }
}

const stopLightSensor = () => {
  if (lightSensor.value) {
    lightSensor.value.stop()
    lightSensor.value = null
    ambientLight.value = null
    $q.notify({
      type: 'info',
      message: 'Lichtsensor gestoppt'
    })
  }
}

const getLightDescription = (lux) => {
  if (lux === null) return 'Nicht gemessen'
  if (lux < 50) return 'Sehr dunkel'
  if (lux < 200) return 'Dämmerung'
  if (lux < 500) return 'Normale Beleuchtung'
  if (lux < 1000) return 'Hell'
  return 'Sehr hell'
}

// ========== MICROPHONE SENSOR ==========
const toggleMicrophone = async () => {
  if (microphoneActive.value) {
    stopMicrophone()
  } else {
    await startMicrophone()
  }
}

const startMicrophone = async () => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    })

    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    analyser = audioContext.createAnalyser()
    microphone = audioContext.createMediaStreamSource(mediaStream)
    javascriptNode = audioContext.createScriptProcessor(2048, 1, 1)

    analyser.smoothingTimeConstant = 0.3
    analyser.fftSize = 1024

    microphone.connect(analyser)
    analyser.connect(javascriptNode)
    javascriptNode.connect(audioContext.destination)

    javascriptNode.onaudioprocess = () => {
      const array = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(array)
      const values = array.reduce((a, b) => a + b, 0)
      const average = values / array.length
      // Konvertiere zu dB (approximativ)
      noiseLevel.value = Math.max(0, Math.floor(average * 0.5))
    }

    microphoneActive.value = true
    $q.notify({
      type: 'positive',
      message: 'Mikrofon gestartet'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Mikrofon Zugriff verweigert: ${error.message}`
    })
  }
}

const stopMicrophone = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
  }
  if (microphone) {
    microphone.disconnect()
  }
  if (javascriptNode) {
    javascriptNode.disconnect()
  }
  if (analyser) {
    analyser.disconnect()
  }
  if (audioContext) {
    audioContext.close()
  }

  microphoneActive.value = false
  noiseLevel.value = null
  $q.notify({
    type: 'info',
    message: 'Mikrofon gestoppt'
  })
}

const getNoiseDescription = (db) => {
  if (db === null) return 'Nicht gemessen'
  if (db < 20) return 'Sehr leise'
  if (db < 40) return 'Leise'
  if (db < 60) return 'Mäßig'
  if (db < 80) return 'Laut'
  return 'Sehr laut'
}

// const getNoiseColor = (db) => {
//   if (db === null) return 'grey'
//   if (db < 40) return 'positive'
//   if (db < 60) return 'warning'
//   return 'negative'
// }

// ========== GPS SENSOR ==========
const toggleGPS = () => {
  if (gpsWatchId.value) {
    stopGPS()
  } else {
    startGPS()
  }
}

const startGPS = () => {
  if ('geolocation' in navigator) {
    gpsWatchId.value = navigator.geolocation.watchPosition(
      (position) => {
        gpsData.value = {
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
          altitude: position.coords.altitude ? position.coords.altitude.toFixed(2) : null,
          accuracy: position.coords.accuracy.toFixed(2)
        }
      },
      (error) => {
        $q.notify({
          type: 'negative',
          message: `GPS Fehler: ${error.message}`
        })
        stopGPS()
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
    $q.notify({
      type: 'positive',
      message: 'GPS gestartet'
    })
  } else {
    $q.notify({
      type: 'warning',
      message: 'Geolocation API nicht unterstützt'
    })
  }
}

const stopGPS = () => {
  if (gpsWatchId.value) {
    navigator.geolocation.clearWatch(gpsWatchId.value)
    gpsWatchId.value = null
    $q.notify({
      type: 'info',
      message: 'GPS gestoppt'
    })
  }
}

// ========== BATTERY SENSOR ==========
const initBatterySensor = () => {
  if ('getBattery' in navigator) {
    navigator.getBattery().then((battery) => {
      updateBatteryInfo(battery)

      battery.addEventListener('chargingchange', () => {
        updateBatteryInfo(battery)
      })
      battery.addEventListener('levelchange', () => {
        updateBatteryInfo(battery)
      })
    })
  } else if ('battery' in navigator) {
    navigator.battery.then((battery) => {
      updateBatteryInfo(battery)
    })
  } else {
    console.warn('Battery API nicht unterstützt')
  }
}

const updateBatteryInfo = (battery) => {
  batteryData.value = {
    level: battery.level,
    charging: battery.charging
  }
}

const getBatteryColor = (level) => {
  if (level > 0.7) return 'positive'
  if (level > 0.3) return 'warning'
  return 'negative'
}

// ========== MOTION SENSOR ==========
const initMotionSensor = () => {
  if ('DeviceMotionEvent' in window) {
    window.addEventListener('devicemotion', handleMotion)
  } else {
    console.warn('DeviceMotionEvent nicht unterstützt')
  }
}

const handleMotion = (event) => {
  motionData.value = {
    acceleration: event.acceleration
  }
}

// ========== ORIENTATION SENSOR ==========
const initOrientationSensor = () => {
  if ('DeviceOrientationEvent' in window) {
    window.addEventListener('deviceorientation', handleOrientation)
  } else {
    console.warn('DeviceOrientationEvent nicht unterstützt')
  }
}

const handleOrientation = (event) => {
  orientationData.value = {
    alpha: event.alpha,
    beta: event.beta,
    gamma: event.gamma
  }
}

// ========== VIBRATION SENSOR ==========
const vibrate = (pattern) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
    $q.notify({
      type: 'positive',
      message: 'Vibration aktiviert'
    })
  } else {
    $q.notify({
      type: 'warning',
      message: 'Vibration API nicht unterstützt'
    })
  }
}

const stopVibration = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(0)
    $q.notify({
      type: 'info',
      message: 'Vibration gestoppt'
    })
  }
}

// ========== LIFECYCLE ==========
const cleanupSensors = () => {
  stopLightSensor()
  stopMicrophone()
  stopGPS()
  stopVibration()

  if ('DeviceMotionEvent' in window) {
    window.removeEventListener('devicemotion', handleMotion)
  }

  if ('DeviceOrientationEvent' in window) {
    window.removeEventListener('deviceorientation', handleOrientation)
  }
}

onMounted(() => {
  initBatterySensor()
  initMotionSensor()
  initOrientationSensor()
})

onUnmounted(() => {
  cleanupSensors()
})
</script>

<style scoped>
.sensors-page {
  max-width: 800px;
  margin: 0 auto;
}

.q-card {
  border-radius: 12px;
}

.text-h4 {
  color: #1976d2;
  font-weight: 600;
}
</style>