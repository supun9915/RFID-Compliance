import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all /autocomply requests to the backend to avoid CORS in dev
      "/autocomply": {
        target: "http://localhost:29288",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
