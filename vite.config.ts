import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative Pfade, damit der Build auch unter /<repo>/ auf GitHub Pages läuft.
  base: './',
  plugins: [react()],
})
