/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from 'path'
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), visualizer({
              filename: 'dist/stats.html',
              gzipSize: true,
              brotliSize: true,
            })],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest-setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules\/(react|react-dom|react-router-dom)/, minSize: 20000 },
            { name: 'recharts', test: /node_modules\/recharts/, minSize: 20000 },
            { name: 'supabase', test: /node_modules\/@supabase/, minSize: 20000 },
          ],
        },
      },
    },
  },
});
