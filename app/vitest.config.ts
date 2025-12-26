// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true, // <--- Asta face 'expect' vizibil peste tot
    setupFiles: './vitest.setup.js', // <--- Asta încarcă biblioteca de dom automat
  },
})