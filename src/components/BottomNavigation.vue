<script setup>
import { RouterLink } from 'vue-router'

import { translate } from '../i18n'
import { useAppStore } from '../stores/app'

const app = useAppStore()
</script>

<template>
  <nav class="bottom-navigation" :aria-label="translate(app.locale, 'mainNavigation')">
    <RouterLink class="navigation-item" to="/"><span class="navigation-item__icon" aria-hidden="true">⌂</span><span>{{ translate(app.locale, 'main') }}</span></RouterLink>
    <RouterLink class="navigation-item" to="/laporan"><span class="navigation-item__icon" aria-hidden="true">▤</span><span>{{ translate(app.locale, 'report') }}</span></RouterLink>
    <RouterLink class="navigation-item" to="/pengaturan"><span class="navigation-item__icon" aria-hidden="true">⚙</span><span>{{ translate(app.locale, 'settings') }}</span></RouterLink>
  </nav>
</template>
