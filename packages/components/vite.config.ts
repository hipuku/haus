import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * Library build.
 *
 * Vite rather than tsup — the rest of the workspace uses tsup, but tsup routes
 * every stylesheet through esbuild's global `css` loader, which turns each
 * *.module.css into plain global CSS and hands the component an empty styles
 * object (`className="undefined"` on every element, silently). Vite's PostCSS
 * pipeline scopes CSS modules properly, which is the whole reason this package
 * needs a build in the first place.
 *
 * Declarations come from `tsc --emitDeclarationOnly`; see package.json.
 */
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      // Readable in devtools, still collision-proof: `haus-Button-button-a1b2c3`.
      generateScopedName: 'haus-[folder]-[local]-[hash:base64:5]',
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    sourcemap: true,
    cssCodeSplit: false,
    rollupOptions: {
      // The consumer's React must be the only React — two copies break hooks.
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        // Stable name so the exports map can point at it.
        assetFileNames: 'styles.css',
      },
    },
  },
})
