import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Force strict port
    strictPort: true,
    // Disable cache for development
    hmr: {
      overlay: true,
    },
    // Add headers to prevent caching
    headers: {
      'Cache-Control': 'no-store',
    }
  },
  // Add timestamp to generated files to prevent caching
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`
      }
    }
  }
});
