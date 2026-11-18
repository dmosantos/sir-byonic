import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  css: {
    modules: { localsConvention: 'camelCase' },
  },
  test: {
    environment: 'jsdom',
    clearMocks: true,
  },
})
