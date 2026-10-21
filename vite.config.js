import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base path ensures game works in any portal subdirectory / iframe
  base: './',
  server: {
    port: 3000,
    open: true,
  },
});
