import { defineStore } from 'pinia'

const LS_SIDEBAR_KEY = 'app_sidebarCollapsed'

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export const useAppStore = defineStore('app', {
  state: () => {
    const sidebarCollapsed = safeJsonParse(localStorage.getItem(LS_SIDEBAR_KEY), false)
    return {
      sidebarCollapsed,
    }
  },
  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
      localStorage.setItem(LS_SIDEBAR_KEY, JSON.stringify(this.sidebarCollapsed))
    },
    setSidebarCollapsed(collapsed) {
      this.sidebarCollapsed = collapsed
      localStorage.setItem(LS_SIDEBAR_KEY, JSON.stringify(collapsed))
    },
  },
})
