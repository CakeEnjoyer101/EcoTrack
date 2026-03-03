<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h1 class="text-h4 text-primary text-weight-bold q-mb-xs">Einstellungen</h1>
        <p class="text-subtitle1 text-grey-7 q-mb-none">Werden lokal in Pinia gespeichert</p>
      </div>
    </div>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Allgemein</div>
      </q-card-section>
      <q-card-section>
        <q-toggle v-model="settings.darkMode" label="Dunkles Design" color="primary" @update:model-value="persist" />
        <q-toggle
          v-model="settings.notifications"
          label="Benachrichtigungen"
          color="primary"
          class="q-mt-md"
          @update:model-value="persist"
        />
      </q-card-section>
    </q-card>

    <q-card>
      <q-card-section>
        <div class="text-h6">App Info</div>
      </q-card-section>
      <q-card-section>
        <p class="q-mb-sm"><strong>Name:</strong> EcoTrack</p>
        <p class="q-mb-sm"><strong>Version:</strong> 1.0.0</p>
        <p class="q-mb-none"><strong>Typ:</strong> Klassische PWA mit Express Backend</p>
      </q-card-section>
    </q-card>
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
