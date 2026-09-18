import { defineStore } from 'pinia'

import { getCategory, listCategories, restoreCategory } from '../services/api/categories-api'
import { getTransaction, listTransactions, restoreTransaction } from '../services/api/transactions-api'

export const useTrashStore = defineStore('trash', {
  state: () => ({
    categories: [],
    error: null,
    status: 'idle',
    transactions: [],
  }),

  actions: {
    async load() {
      this.status = 'loading'
      this.error = null
      try {
        const [transactions, categories] = await Promise.all([
          listTransactions({ isDelete: true }),
          listCategories({ isDelete: true }),
        ])
        this.transactions = transactions.data
        this.categories = categories
        this.status = 'ready'
      } catch (error) {
        this.error = error
        this.status = 'error'
      }
    },

    async restoreTransaction(id) {
      const transaction = await getTransaction(id, { isDelete: true })
      return restoreTransaction(id, transaction.version)
    },

    async restoreCategory(id) {
      const category = await getCategory(id, { isDelete: true })
      return restoreCategory(id, category.version)
    },

    reset() { this.$reset() },
  },
})
