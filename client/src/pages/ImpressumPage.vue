<template>
  <q-page class="impressum-page q-pa-md">
    <q-card class="impressum-card">
      <q-card-section class="text-center">
        <h1 class="text-h4 text-primary text-weight-bold q-mb-md">Impressum</h1>
        <p class="text-body1 q-mb-sm">Implementiert von Sven-Erik Reinhart</p>
        <p class="text-body1 q-mb-lg">Copyright HTL Wien West, 2025</p>
        <q-btn color="primary" label="Zurueck zur Startseite" to="/" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
</script>

<style scoped>
.impressum-page {
  display: flex;
  align-items: center;
  justify-content: center;
}

.impressum-card {
  width: 100%;
  max-width: 640px;
}
</style>
