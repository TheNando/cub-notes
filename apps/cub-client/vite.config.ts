import { defineConfig } from "vite-plus";

export default defineConfig({
  server: {
    proxy: {
      "/trpc": "http://localhost:3000",
    },
  },
});
