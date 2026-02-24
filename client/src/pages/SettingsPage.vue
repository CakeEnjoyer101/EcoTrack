<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h1 class="text-h4 text-primary text-weight-bold">Einstellungen</h1>
        <p class="text-subtitle1 text-grey-7">Werden persistent in Pinia + localStorage gespeichert</p>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Allgemein</div>
          </q-card-section>
          <q-card-section>
            <q-toggle v-model="settings.darkMode" label="Dark Mode" color="primary" @update:model-value="persist" />
            <q-toggle
              v-model="settings.notifications"
              label="Benachrichtigungen"
              color="primary"
              class="q-mt-md"
              @update:model-value="persist"
            />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Sensoren</div>
          </q-card-section>
          <q-card-section>
            <q-toggle
              v-model="settings.autoStartSensors"
              label="Sensoren automatisch starten"
              color="primary"
              @update:model-value="persist"
            />
            <q-toggle
              v-model="settings.saveSensorData"
              label="Sensordaten speichern"
              color="primary"
              class="q-mt-md"
              @update:model-value="persist"
            />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Ueber EcoTrack</div>
          </q-card-section>
          <q-card-section>
            <div class="text-body2">
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Entwickelt fuer:</strong> PWA Projekt</p>
              <p><strong>Beschreibung:</strong> Umwelt & Gesundheitsmonitor</p>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { reactive } from 'vue'
import { useEcoTrackStore } from 'src/stores/ecotrack-store'

const store = useEcoTrackStore()
if (!store.initialized) {
  store.loadFromLocalStorage()
}

const settings = reactive({ ...store.settings })

const persist = () => {
  store.updateSettings(settings)
}
</script>
