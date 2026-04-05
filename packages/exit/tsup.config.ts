import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@tanstack/react-query',
    '@rsksmart/flyover-sdk',
    '@rsksmart/rsk-swap-sdk',
    '@rsksmart/powpeg-sdk',
    '@rsksmart/bridges-core-sdk',
  ],
})
