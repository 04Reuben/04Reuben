import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/04Reuben/',
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      less: { javascriptEnabled: true },
    },
  },
})
