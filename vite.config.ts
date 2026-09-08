import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const basePath = process.env.VITE_BASE_PATH ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base: basePath,
  define: { 'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL ?? '') },
  plugins: [react(), VitePWA({ registerType: 'autoUpdate', manifest: { name: 'Brubar!', short_name: 'Brubar!', description: 'Atenda rápido. Feche fácil.', theme_color: '#161A1D', background_color: '#F7F8F7', display: 'standalone', start_url: basePath, scope: basePath, icons: [{ src: `${basePath}brubar.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] } })],
})
