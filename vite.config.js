import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Migrated for Vite 8 (guides: v5→v6, v6→v7, v7→v8):
// - esbuild transform options → oxc
// - optimizeDeps.esbuildOptions → optimizeDeps.rolldownOptions
// - object manualChunks removed → rolldown codeSplitting groups
export default defineConfig({
  plugins: [react()],
  base: '/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
  // Allow JSX/TSX in src (Vite 8: Oxc instead of esbuild)
  oxc: {
    include: /src\/.*\.[jt]sx?$/,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    minify: 'terser',
    cssMinify: true,
    // Vite 8 / Rolldown: object-form manualChunks removed
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom)([\\/]|$)/,
            },
          ],
        },
      },
    },
    sourcemap: false,
    // Ensure index.html is copied to dist
    copyPublicDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 3000
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    // Vite 8: Rolldown optimizer (was esbuildOptions.loader)
    rolldownOptions: {
      moduleTypes: {
        '.js': 'jsx',
      },
    },
  }
})
