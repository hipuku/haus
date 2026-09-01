import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * Library build.
 *
 * Vite rather than tsup. The rest of the workspace uses tsup, but tsup routes
 * every stylesheet through esbuild's global `css` loader, which turns each
 * *.module.css into plain global CSS and hands the component an empty styles
 * object (`className="undefined"` on every element, silently). Vite's PostCSS
 * pipeline scopes CSS modules properly, which is the whole reason this package
 * needs a build in the first place.
 *
 * Declarations come from `tsc --emitDeclarationOnly`; see package.json.
 */
/**
 * Wraps the emitted stylesheet in `@layer haus.components`.
 *
 * Decision B1 and `docs/decisions/0006`. The token layers are layered and this
 * stylesheet was not, so it competed with a consumer's own module CSS by source
 * order: whether a component's style or a consumer's override won depended on
 * import order rather than on anything either of them declared. Layered, the
 * package states its own precedence and any unlayered rule of the consumer's
 * beats it without a specificity fight.
 *
 * Done at emit rather than in each *.module.css, because CSS modules are
 * concatenated into one file here and one wrapper is the honest shape: the
 * layer is a property of the published stylesheet, not of thirteen sources.
 *
 * In writeBundle rather than generateBundle: Vite emits the stylesheet after
 * generateBundle has run, so a plugin that rewrites the bundle there sees no CSS
 * at all and silently does nothing — which is what the first version of this
 * did.
 */
function layerStylesheet(): Plugin {
  return {
    name: 'haus-layer-stylesheet',
    async writeBundle(options) {
      const dir = options.dir ?? 'dist'
      const file = resolve(dir, 'styles.css')
      const css = await readFile(file, 'utf8')
      if (css.includes('@layer haus.components')) return

      // @import must stay at the top of the file, outside the block. There are
      // none today; hoisting them keeps that true if one ever arrives.
      const imports: string[] = []
      const body = css.replace(/@import[^;]+;/g, (m) => {
        imports.push(m.trim())
        return ''
      })
      const head = imports.length ? `${imports.join('\n')}\n\n` : ''
      await writeFile(file, `${head}@layer haus.components {\n${body.trim()}\n}\n`)
    },
  }
}

export default defineConfig({
  plugins: [react(), layerStylesheet()],
  css: {
    modules: {
      // Readable in devtools, still collision-proof: `haus-Button-button-a1b2c3`.
      generateScopedName: 'haus-[folder]-[local]-[hash:base64:5]',
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      // ESM and CJS both, so `main` and the require condition point at something
      // that actually works in the context they advertise for. See N30.
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    sourcemap: true,
    cssCodeSplit: false,
    rollupOptions: {
      // The consumer's React must be the only React, because two copies break hooks.
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        // Stable name so the exports map can point at it.
        assetFileNames: 'styles.css',
      },
    },
  },
})
