import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // 1. Local Spring Boot Backend (Forced to IPv4 to prevent ECONNREFUSED)
      '/api': {
        target: 'http://127.0.0.1:8080', // ✅ Changed from localhost to 127.0.0.1
        changeOrigin: true,
        secure: false,
        // We keep the rewrite to ensure /api/portfolio -> http://127.0.0.1:8080/api/portfolio
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },

      // 2. CoinGecko API Proxy
      '/coingecko': {
        target: 'https://api.coingecko.com/api/v3',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/coingecko/, ''),
        proxyTimeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      },
    },
  },
})