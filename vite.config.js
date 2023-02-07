// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        timy: resolve(__dirname, "timy.html"),
        json: resolve(__dirname, "teamsPhoto.json"),
      },
    },
  },
});
