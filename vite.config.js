import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        // اگر خواستی روی لوکال تست کنی خط پایینی رو کامنت و اینو فعال کن:
        // target: "http://localhost:8000",
        target: "http://188.121.114.194:9000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
