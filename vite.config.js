import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/metals': {
        target: 'https://api.metals.live',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/metals/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => console.log('metals proxy error', err))
        }
      },
      '/api/yahoo': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        configure: (proxy) => {
          proxy.on('error', (err) => console.log('yahoo proxy error', err))
        }
      }
    }
  }
})