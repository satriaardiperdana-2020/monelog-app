import { defineStore } from 'pinia'

import { getReportBreakdown, getReportSummary } from '../services/api/reports-api'
import { isValidDate } from '../utils/dates'

function rangeError(startDate, endDate) {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return 'Masukkan tanggal mulai dan tanggal selesai yang valid.'
  }
  if (startDate > endDate) return 'Tanggal mulai tidak boleh setelah tanggal selesai.'
  return null
}

export const useReportsStore = defineStore('reports', {
  state: () => ({
    breakdown: null,
    endDate: '',
    error: null,
    startDate: '',
    status: 'idle',
    summary: null,
    validationError: null,
  }),

  getters: {
    isEmpty: (state) => state.status === 'ready' && (state.breakdown?.categories?.length || 0) === 0,
  },

  actions: {
    setRange({ endDate, startDate }) {
      this.startDate = startDate
      this.endDate = endDate
      this.validationError = rangeError(startDate, endDate)
      return !this.validationError
    },

    async load({ isAdmin = false, selectedUserId, signal } = {}) {
      if (!this.setRange({ endDate: this.endDate, startDate: this.startDate })) return false
      if (isAdmin && !selectedUserId) {
        this.validationError = 'Pilih pengguna terlebih dahulu.'
        return false
      }

      this.error = null
      this.status = 'loading'
      const filter = {
        endDate: this.endDate,
        isAdmin,
        range: 'custom',
        selectedUserId,
        signal,
        startDate: this.startDate,
      }

      try {
        const [summary, breakdown] = await Promise.all([
          getReportSummary(filter),
          getReportBreakdown({ ...filter, groupBy: 'category' }),
        ])
        this.summary = summary
        this.breakdown = breakdown
        this.status = 'ready'
        return true
      } catch (error) {
        this.error = error
        this.status = 'error'
        return false
      }
    },
  },
})
