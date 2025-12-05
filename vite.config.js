
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["socket.io-client"], // força o Vite a otimizar esse pacote
  },
  build: {
    rollupOptions: {
      external: [], // garante que não seja externalizado
    },
    commonjsOptions: {
      include: [/socket.io-client/, /node_modules/],
    },
  },
});
