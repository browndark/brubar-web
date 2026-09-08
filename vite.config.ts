import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  define: { 'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL ?? '') },
  plugins: [react(), VitePWA({ registerType: 'autoUpdate', manifest: { name: 'Brubar!', short_name: 'Brubar!', description: 'Atenda rápido. Feche fácil.', theme_color: '#161A1D', background_color: '#F7F8F7', display: 'standalone', icons: [{ src: '/brubar.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] } })],
})
