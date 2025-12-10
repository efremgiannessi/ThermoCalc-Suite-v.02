import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 'base: "./"' è fondamentale per hosting condivisi come Aruba
  // permette al sito di funzionare anche se caricato in una sottocartella
  base: './',
  build: {
    outDir: 'dist',
  }
})