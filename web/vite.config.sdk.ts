import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/sdk/GameSDK.ts'),
      name: 'GameSDK',
      fileName: (format) => `game-sdk.${format}.js`,
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
 * AI Game Platform SDK
 * Version: 1.0.0
 * 
 * Usage:
 * <script src="/sdk/game-sdk.umd.js"></script>
 * const sdk = new GameSDK.GameSDK({ gameId: 'your-game-id' });
 * 
 * Or ES Module:
 * import { GameSDK } from '/sdk/game-sdk.es.js';
 */
`,
      },
    },
  },
})
