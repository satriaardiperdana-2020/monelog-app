<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <aside class="desktop-navigation">
    <RouterLink class="desktop-navigation__brand" to="/">Catatan Keuangan</RouterLink>
    <nav class="desktop-navigation__links" aria-label="Navigasi utama">
      <RouterLink to="/">Utama</RouterLink>
      <RouterLink to="/laporan">Laporan</RouterLink>
      <RouterLink to="/pengaturan">Setelan</RouterLink>
    </nav>
  </aside>
</template>
