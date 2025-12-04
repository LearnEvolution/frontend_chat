import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
plugins: [react()],
resolve: {
dedupe: ['axios'] // Garante que axios será incluído no bundle
}
})
