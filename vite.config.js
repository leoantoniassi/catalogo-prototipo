import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/catalogo-prototipo/',
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    css: true,
    restoreMocks: true,
    testTimeout: 20000,
  },
})
