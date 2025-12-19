<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h1 class="text-h4 text-primary text-weight-bold">Einstellungen</h1>
        <p class="text-subtitle1 text-grey-7">App-Konfiguration</p>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Allgemein</div>
          </q-card-section>
          <q-card-section>
            <q-toggle
              v-model="darkMode"
              label="Dark Mode"
              color="primary"
            />
            <q-toggle
              v-model="notifications"
              label="Benachrichtigungen"
              color="primary"
              class="q-mt-md"
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
              v-model="autoStartSensors"
              label="Sensoren automatisch starten"
              color="primary"
            />
            <q-toggle
              v-model="saveSensorData"
              label="Sensordaten speichern"
              color="primary"
              class="q-mt-md"
            />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Über EcoTrack</div>
          </q-card-section>
          <q-card-section>
            <div class="text-body2">
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Entwickelt für:</strong> PWA Projekt</p>
              <p><strong>Beschreibung:</strong> Umwelt & Gesundheits Monitor</p>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const darkMode = ref(false)
const notifications = ref(true)
const autoStartSensors = ref(false)
const saveSensorData = ref(true)
</script>