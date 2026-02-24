<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title class="text-weight-bold row items-center">
          <q-avatar size="32px" class="q-mr-sm">
            <img src="/icons/EcoTrack-logo.png" alt="EcoTrack Logo" />
          </q-avatar>
          EcoTrack
        </q-toolbar-title>

        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          class="q-mr-xs"
          @click="toggleLeftDrawer"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      bordered
      :width="280"
      :breakpoint="768"
      class="bg-grey-1"
    >
      <q-scroll-area class="fit">
        <q-list padding class="text-primary">
          <q-item class="q-mb-md">
            <q-item-section avatar>
              <q-avatar size="48px">
                <img src="/icons/EcoTrack-logo.png" alt="EcoTrack Logo" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6 text-weight-bold" style="color: #26a69a">EcoTrack</q-item-label>
              <q-item-label caption>Umwelt & Gesundheitsmonitor</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-mb-md" />

          <q-item clickable v-ripple to="/" exact class="nav-item">
            <q-item-section avatar>
              <q-icon name="dashboard" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Dashboard</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/mood-tracker" class="nav-item">
            <q-item-section avatar>
              <q-icon name="mood" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Stimmung</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/sensors" class="nav-item">
            <q-item-section avatar>
              <q-icon name="sensors" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Sensoren</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/analytics" class="nav-item">
            <q-item-section avatar>
              <q-icon name="analytics" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Analysen</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-mt-md q-mb-md" />

          <q-item clickable v-ripple to="/settings" class="nav-item">
            <q-item-section avatar>
              <q-icon name="settings" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Einstellungen</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/impressum" class="nav-item q-mt-md">
            <q-item-section avatar>
              <q-icon name="info" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Impressum</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const leftDrawerOpen = ref(false)

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style scoped>
.q-header {
  box-shadow: 0 2px 12px rgba(38, 166, 154, 0.2);
  background: linear-gradient(135deg, #26a69a 0%, #00796b 100%);
}

.q-drawer {
  border-right: 1px solid #e0e0e0;
}

.nav-item:hover {
  background-color: rgba(38, 166, 154, 0.1);
  border-radius: 8px;
}

.nav-item.q-router-link--active {
  background-color: rgba(38, 166, 154, 0.15);
  border-left: 4px solid #26a69a;
  border-radius: 8px 0 0 8px;
}

.q-item__label {
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
}

.q-toolbar__title {
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
}

@media (max-width: 768px) {
  .q-drawer {
    width: 240px !important;
  }
}
</style>

