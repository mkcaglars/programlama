import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Göreli taban yol: GitHub Pages veya herhangi bir alt klasörde çalışır.
export default defineConfig({
  base: './',
  plugins: [react()],
})
