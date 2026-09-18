<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <RouterLink class="brand" to="/">Monelog</RouterLink>
      <nav aria-label="Navigasi utama">
        <RouterLink to="/">Beranda</RouterLink>
      </nav>
    </header>

    <main class="app-main" tabindex="-1">
      <RouterView />
    </main>
  </div>
</template>
