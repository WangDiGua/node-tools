import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI Libraries (heavy ones)
          'vendor-ui': ['lucide-react', 'framer-motion', 'echarts'],
          // Form handling
          'vendor-utils': ['react-hook-form', 'zod', 'clsx', 'tailwind-merge']
        }
      }
    }
  }
});