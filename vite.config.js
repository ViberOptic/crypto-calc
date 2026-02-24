import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Kalkulator Kripto',
        short_name: 'KriptoCalc',
        description: 'Kalkulator Enkripsi dan Dekripsi Berbasis Web',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'https://via.placeholder.com/192', // Ganti dengan ikon 192x192 asli jika ada
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://via.placeholder.com/512', // Ganti dengan ikon 512x512 asli jika ada
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})