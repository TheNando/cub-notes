import { defineConfig } from "vite-plus";

export default defineConfig({
  resolve: {
    alias: {
      ui: new URL("../../packages/ui/src/index.ts", import.meta.url).pathname,
    },
  },
  server: {
    proxy: {
      "/trpc": "http://localhost:3000",
    },
  },
});
