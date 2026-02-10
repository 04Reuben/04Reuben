import { defineStore } from 'pinia'

const LS_THEME_KEY = 'app_theme'

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export const useThemeStore = defineStore('theme', {
  state: () => {
    const saved = localStorage.getItem(LS_THEME_KEY)
    const theme = safeJsonParse(saved, 'light')
    return {
      theme,
    }
  },
  getters: {
    isDark: (state) => state.theme === 'dark',
  },
  actions: {
    setTheme(theme) {
      this.theme = theme
      localStorage.setItem(LS_THEME_KEY, JSON.stringify(theme))
    },
    toggleTheme() {
      const newTheme = this.theme === 'light' ? 'dark' : 'light'
      this.setTheme(newTheme)
    },
  },
})