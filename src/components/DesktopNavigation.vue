<script setup>
import { RouterLink } from 'vue-router'

import { translate } from '../i18n'
import { useAppStore } from '../stores/app'

const app = useAppStore()
</script>

<template>
  <aside class="desktop-navigation">
    <RouterLink class="desktop-navigation__brand" to="/">{{ translate(app.locale, 'appName') }}</RouterLink>
    <nav class="desktop-navigation__links" :aria-label="translate(app.locale, 'mainNavigation')">
      <RouterLink to="/">{{ translate(app.locale, 'main') }}</RouterLink>
      <RouterLink to="/laporan">{{ translate(app.locale, 'report') }}</RouterLink>
      <RouterLink to="/pengaturan">{{ translate(app.locale, 'settings') }}</RouterLink>
    </nav>
  </aside>
</template>
