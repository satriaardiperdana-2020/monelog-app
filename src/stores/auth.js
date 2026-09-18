import { defineStore, getActivePinia } from 'pinia'

import * as authApi from '../services/api/auth-api'
import * as profileApi from '../services/api/profile-api'
import { configureHttpAuth } from '../services/http'

const sessionResetters = new Set()
const GENERIC_LOGIN_ERROR = 'Email atau kata sandi tidak valid. Coba lagi.'

export function registerSessionStoreReset(reset) {
  sessionResetters.add(reset)
  return () => sessionResetters.delete(reset)
}

function safeRoute(route) {
  return typeof route === 'string' && route.startsWith('/') && !route.startsWith('//')
    ? route
    : null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    user: null,
    initialized: false,
    sessionExpired: false,
    intendedRoute: null,
    bootstrapPromise: null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken && state.user),
  },

  actions: {
    configureHttp() {
      configureHttpAuth({
        getAccessToken: () => this.accessToken,
        refreshAccessToken: () => this.refreshAccessToken(),
        clearSession: () => this.clearSession({ expired: true }),
      })
    },

    setIntendedRoute(route) {
      this.intendedRoute = safeRoute(route)
    },

    consumeIntendedRoute() {
      const route = this.intendedRoute || '/'
      this.intendedRoute = null
      return route
    },

    setAccessToken(response) {
      if (!response?.access_token) throw new Error('Login response has no access token.')
      this.accessToken = response.access_token
      this.sessionExpired = false
    },

    async loadMe() {
      this.configureHttp()
      const user = await profileApi.getMe()
      this.user = user
      return user
    },

    async updateProfile(timezone) {
      const user = await profileApi.updateMe({ timezone, version: this.user.version })
      this.user = user
      return user
    },

    async refreshAccessToken() {
      this.configureHttp()
      const response = await authApi.refresh()
      this.setAccessToken(response)
      return true
    },

    async login(credentials) {
      this.configureHttp()

      try {
        const response = await authApi.login(credentials)
        this.setAccessToken(response)
        return await this.loadMe()
      } catch {
        this.clearSession({ expired: false })
        throw new Error(GENERIC_LOGIN_ERROR)
      }
    },

    async bootstrap() {
      this.configureHttp()
      if (this.initialized) return this.isAuthenticated
      if (this.bootstrapPromise) return this.bootstrapPromise

      this.bootstrapPromise = (async () => {
        try {
          await this.refreshAccessToken()
          await this.loadMe()
          return true
        } catch {
          // A first refresh 401/403 only means the browser has no usable
          // session yet. Do not present it as an expired in-app session.
          this.clearSession({ expired: false })
          return false
        } finally {
          this.initialized = true
          this.bootstrapPromise = null
        }
      })()

      return this.bootstrapPromise
    },

    async logout() {
      this.configureHttp()
      try {
        await authApi.logout()
      } finally {
        this.clearSession({ expired: false })
        this.intendedRoute = null
      }
    },

    clearSession({ expired = false } = {}) {
      this.accessToken = null
      this.user = null
      this.initialized = true
      this.sessionExpired = expired
      sessionResetters.forEach((reset) => reset())
      getActivePinia()?._s.forEach((store) => {
        if (store.$id !== this.$id) store.$reset?.()
      })
    },
  },
})

export { GENERIC_LOGIN_ERROR }
