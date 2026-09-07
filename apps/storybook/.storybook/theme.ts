import { create } from 'storybook/theming'

/**
 * haus's Storybook theme, used in two places: the manager chrome (sidebar,
 * toolbar) via manager.ts, and the docs pages via preview.ts.
 *
 * The docs pages need it explicitly. Without a theme they render in Storybook's
 * default palette, so the documentation for haus would sit on chrome that is
 * not haus. The wordmark and logo are served from /brand/* through staticDirs
 * in main.ts; the plum is aronia, the brand primitive, matched to
 * --haus-color-primary-default.
 */
export const hausTheme = create({
  base: 'light',

  brandTitle: 'haus',
  brandUrl: 'https://haus.hipuku.dev',
  brandImage: '/brand/wordmark.svg',
  brandTarget: '_self',

  fontBase: '"Manrope", system-ui, sans-serif',
  fontCode: '"Fira Code", ui-monospace, monospace',

  colorPrimary: '#623A8F',
  colorSecondary: '#623A8F',

  appBorderRadius: 8,
})
