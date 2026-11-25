import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: { target: 'es2022' }, // top-level await en main.js
  server: {
    port: 5173,
    open: true,
    // En desarrollo la API corre aparte (npm run api)
    proxy: { '/api': 'http://localhost:3001' }
  }
})
