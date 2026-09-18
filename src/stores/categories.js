import { defineStore } from 'pinia'

import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '../services/api/categories-api'

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    byType: { expense: [], income: [] },
    errorByType: { expense: null, income: null },
    statusByType: { expense: 'idle', income: 'idle' },
  }),

  actions: {
    async load(type) {
      this.statusByType[type] = 'loading'
      this.errorByType[type] = null
      try {
        this.byType[type] = await listCategories({ isDelete: false, type })
        this.statusByType[type] = 'ready'
      } catch (error) {
        this.errorByType[type] = error
        this.statusByType[type] = 'error'
      }
    },

    create(payload) { return createCategory(payload) },
    update(id, payload) { return updateCategory(id, payload) },
    delete(id, version) { return deleteCategory(id, version) },

    reset() { this.$reset() },
  },
})
