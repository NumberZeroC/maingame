import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/sdk/HostSDK.ts'),
      name: 'HostSDK',
      fileName: (format) => `host-sdk.${format}.js`,
      formats: ['umd', 'es'],
    },
    outDir: 'public/sdk',
    emptyOutDir: false,
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      external: [],
      output: {
        globals: {},
        banner: `/**
 * AI Game Platform Host SDK (Platform-side)
 * Version: 1.0.0
 * 
 * This SDK is used by the platform to communicate with games running in iframe.
 * Games should use GameSDK, not HostSDK.
 */
`,
      },
    },
  },
})
