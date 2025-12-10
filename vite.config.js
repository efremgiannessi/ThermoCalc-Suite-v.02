import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Configurazione standard per Netlify (root domain)
  // Non impostare base: './' per Netlify se l'app è nella root
  build: {
    outDir: 'dist',
  }
})