import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const hasLocalResume = existsSync(
  join(rootDir, 'public/documents/cameron-graham-resume.pdf')
)

// https://vitejs.dev/config/
// Migrated for Vite 8 (guides: v5→v6, v6→v7, v7→v8):
// - esbuild transform options → oxc
// - optimizeDeps.esbuildOptions → optimizeDeps.rolldownOptions
// - object manualChunks removed → rolldown codeSplitting groups
export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    __HAS_LOCAL_RESUME__: JSON.stringify(hasLocalResume),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/e2e/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/test/**',
        'src/vite-env.d.ts',
      ],
    },
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
    manifest: true,
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
