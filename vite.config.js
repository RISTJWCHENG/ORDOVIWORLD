import { defineConfig } from 'vite'

export default defineConfig({
  root: 'web',
  server: {
    host: 'localhost',
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://icp-api.io',
        changeOrigin: true,
        secure: true
      }
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'es2020'
  }
})