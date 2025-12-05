import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["socket.io-client"], // força a otimização do socket.io-client
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true, // essencial para Vercel
      include: [/node_modules/, /socket.io-client/],
    },
  },
});
