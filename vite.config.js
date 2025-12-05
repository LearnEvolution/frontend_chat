

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['axios']
  },
  optimizeDeps: {
    include: ['axios', 'socket.io-client'] // inclui socket.io-client na otimização
  }
})
