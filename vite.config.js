import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Sahoyogita',
        short_name: 'Sahoyogita',
        description: 'Continuous Cooperation • Balanced Exchange • Shared Prosperity',
        theme_color: '#0d47a1', // আপোনাৰ ল'গ'ৰ নীলা ৰঙ
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: '/icons/launchericon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/launchericon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
  base: '/', // GitHub ৰিপ'জিটৰীৰ নাম
})
