import { defineStore } from 'pinia'

import { listDailySummaries } from '../services/api/daily-api'
import { daysBefore, todayInTimezone } from '../utils/dates'

const ZERO_SUMMARY = (date) => ({
  date,
  expense: '0.00',
  income: '0.00',
  difference: '0.00',
})

export const useDailyStore = defineStore('daily', {
  state: () => ({
    error: null,
    nextCursor: null,
    requestGeneration: 0,
    startDate: '',
    status: 'idle',
    summaries: [],
    today: '',
    endDate: '',
  }),

  getters: {
    todaySummary: (state) =>
      state.summaries.find((summary) => summary.date === state.today) ||
      ZERO_SUMMARY(state.today),
    earlierSummaries: (state) =>
      state.summaries.filter((summary) => summary.date !== state.today),
  },

  actions: {
    async loadInitial(timezone) {
      const generation = this.requestGeneration + 1
      this.requestGeneration = generation
      this.today = todayInTimezone(timezone)
      this.endDate = this.today
      this.startDate = daysBefore(this.today, 29)
      this.status = 'loading'
      this.error = null

      try {
        const response = await listDailySummaries({
          endDate: this.endDate,
          limit: 30,
          startDate: this.startDate,
        })
        if (generation !== this.requestGeneration) return

        this.summaries = response.data
        this.nextCursor = response.page.next_cursor
        this.status = 'ready'
      } catch (error) {
        if (generation !== this.requestGeneration) return

        this.error = error
        this.status = 'error'
      }
    },

    async loadMore() {
      if (!this.nextCursor || this.status === 'loading-more') return

      this.status = 'loading-more'
      this.error = null
      const cursor = this.nextCursor

      try {
        const response = await listDailySummaries({
          cursor,
          endDate: this.endDate,
          limit: 30,
          startDate: this.startDate,
        })
        this.summaries.push(...response.data)
        this.nextCursor = response.page.next_cursor
        this.status = 'ready'
      } catch (error) {
        this.error = error
        this.status = 'error'
      }
    },

    reset() {
      this.$reset()
    },
  },
})
