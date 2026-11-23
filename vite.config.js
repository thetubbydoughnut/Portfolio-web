import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
  // Allow JSX in .js test files (AC test filenames end in .test.js)
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
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
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  }
})
