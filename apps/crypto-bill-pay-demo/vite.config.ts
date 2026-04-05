import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream', 'crypto', 'events'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    react(),
    wasm(),
    topLevelAwait(),
  ],
  resolve: {
    alias: {
      '@rootstock-kits/exit': path.resolve(__dirname, '../../packages/exit/src/index.ts'),
    },
  },
  optimizeDeps: {
    include: [
      'buffer',
      'process',
      'util',
      'stream-browserify',
      'crypto-browserify',
      '@rsksmart/flyover-sdk',
      '@rsksmart/rsk-swap-sdk',
      '@rsksmart/powpeg-sdk',
      '@rsksmart/bridges-core-sdk',
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
    port: 5173,
  },
})
