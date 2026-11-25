import pseudoStates from './postcss-pseudo-states.mjs'

const config = {
  plugins: [
    // Before Tailwind, so the twins are in place when the rest of the
    // pipeline sees the component stylesheet. See the plugin for why.
    pseudoStates,
    '@tailwindcss/postcss',
  ],
}

export default config
