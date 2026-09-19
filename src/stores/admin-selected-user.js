import { defineStore } from 'pinia'

export const useAdminSelectedUserStore = defineStore('admin-selected-user', {
  state: () => ({
    selectedUser: null,
    selectedUserId: null,
  }),

  actions: {
    selectUser(user) {
      if (!user?.id) throw new Error('Pengguna yang dipilih tidak valid.')

      this.selectedUserId = user.id
      this.selectedUser = {
        email: user.email || '',
        id: user.id,
        timezone: user.timezone || '',
      }
    },

    clearSelectedUser() {
      this.$reset()
    },
  },
})
