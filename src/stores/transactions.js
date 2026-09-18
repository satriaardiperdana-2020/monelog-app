import { defineStore } from 'pinia'

import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  listTransactions,
  updateTransaction,
} from '../services/api/transactions-api'

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({ error: null, items: [], nextCursor: null, selectedDate: '', status: 'idle' }),

  actions: {
    create(payload) {
      return createTransaction(payload)
    },

    delete(id, version) {
      return deleteTransaction(id, version)
    },

    get(id) {
      return getTransaction(id)
    },

    async loadForDate(date) {
      this.selectedDate = date
      this.status = 'loading'
      this.error = null
      try {
        const response = await listTransactions({ endDate: date, limit: 30, startDate: date })
        this.items = response.data
        this.nextCursor = response.page.next_cursor
        this.status = 'ready'
      } catch (error) {
        this.error = error
        this.status = 'error'
      }
    },

    async loadMore() {
      if (!this.nextCursor || this.status === 'loading-more') return
      this.status = 'loading-more'
      this.error = null
      try {
        const response = await listTransactions({ cursor: this.nextCursor, endDate: this.selectedDate, limit: 30, startDate: this.selectedDate })
        this.items.push(...response.data)
        this.nextCursor = response.page.next_cursor
        this.status = 'ready'
      } catch (error) {
        this.error = error
        this.status = 'error'
      }
    },

    update(id, payload) {
      return updateTransaction(id, payload)
    },

    reset() { this.$reset() },
  },
})
