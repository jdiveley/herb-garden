import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['www.blackpawcottage.com', 'blackpawcottage.com', 'test.blackpawcottage.com'],
    proxy: {
      '/api': { target: 'http://localhost:3002', changeOrigin: true },
      '/uploads': { target: 'http://localhost:3002', changeOrigin: true },
    }
  },
})
