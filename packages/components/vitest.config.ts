import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // CSS modules resolve to proxy objects, so `styles.button` returns the key
    // name rather than undefined. Class assertions therefore test the mapping
    // the component makes, not the hashes the bundler happens to generate.
    css: false,
  },
})
