import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '../stores/auth'
import { isValidDate } from '../utils/dates'

export const isValidCalendarDate = isValidDate

function safeIntendedRoute(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : '/'
}

export function createMonelogRouter(history = createWebHistory(import.meta.env.BASE_URL)) {
  const router = createRouter({
    history,
    routes: [
      {
        path: '/login',
        name: 'login',
        component: () => import('../views/LoginView.vue'),
        meta: { publicOnly: true },
      },
      {
        path: '/',
        name: 'home',
        component: () => import('../views/HomeView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/laporan',
        name: 'reports',
        component: () => import('../views/ReportsView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/hari/:date',
        name: 'day-detail',
        component: () => import('../views/DayDetailView.vue'),
        meta: { requiresAuth: true, validatesDate: true },
      },
      {
        path: '/transaksi/tambah',
        name: 'transaction-create',
        component: () => import('../views/TransactionCreateView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/transaksi/:id/edit',
        name: 'transaction-edit',
        component: () => import('../views/TransactionEditView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/kategori',
        name: 'categories',
        component: () => import('../views/CategoriesView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/sampah',
        name: 'trash',
        component: () => import('../views/TrashView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/pengaturan',
        name: 'settings',
        component: () => import('../views/SettingsView.vue'),
        meta: { requiresAuth: true },
      },
    ],
  })

  router.beforeEach(async (to) => {
    const auth = useAuthStore()
    await auth.bootstrap()

    if (to.meta.publicOnly && auth.isAuthenticated) {
      return safeIntendedRoute(to.query.lanjut)
    }

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      auth.setIntendedRoute(to.fullPath)
      return {
        name: 'login',
        query: {
          lanjut: to.fullPath,
          ...(auth.sessionExpired ? { alasan: 'sesi-berakhir' } : {}),
        },
      }
    }

    if (to.meta.validatesDate && !isValidCalendarDate(to.params.date)) {
      return { name: 'home' }
    }

    // Resource IDs, ownership, and roles are authorized only by the backend.
    return true
  })

  return router
}

export { createMemoryHistory }

export default createMonelogRouter()
