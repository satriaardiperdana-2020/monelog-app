import { defineStore } from 'pinia'

const LANGUAGE_KEY = 'monelog-language'

function readLocale() {
  if (typeof localStorage === 'undefined') return 'id'
  return localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'id'
}

export const useAppStore = defineStore('app', {
  state: () => ({
    appName: 'Monelog',
    locale: readLocale(),
  }),

  actions: {
    setLocale(locale) {
      this.locale = locale === 'en' ? 'en' : 'id'
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LANGUAGE_KEY, this.locale)
        localStorage.removeItem('monelog-display-preferences')
      }
    },
  },
})
