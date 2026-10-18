import { defineConfig } from 'vite'
export default defineConfig({
  root: 'web',
  base: process.env.GITHUB_ACTIONS ? '/ORDOVIWORLD/' : '/',
  build: { outDir: '../dist', emptyOutDir: true, target: 'es2020' },
  server: { proxy: { '/api': { target: 'https://icp-api.io', changeOrigin: true, secure: true } } }
})
