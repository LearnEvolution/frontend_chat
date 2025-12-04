import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['axios'] // Garante que axios será incluído no bundle
  },
  optimizeDeps: {
    include: ['axios'] // Força Vite a otimizar e incluir axios
  }
})
