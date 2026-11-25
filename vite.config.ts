import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** The component gallery (gallery/), which the end-to-end tests run against. */
export default defineConfig({
  root: 'gallery',
  plugins: [react(), tailwindcss()],
  build: { outDir: '../gallery-dist', emptyOutDir: true },
  preview: { port: 4173, strictPort: true },
});
