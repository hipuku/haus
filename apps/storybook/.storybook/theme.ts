import { create } from 'storybook/theming'

/**
 * haus's Storybook theme, used in two places: the manager chrome (sidebar,
 * toolbar) via manager.ts, and the docs pages via preview.ts.
 *
 * The docs pages need it explicitly. Without a theme they render in Storybook's
 * default palette, so the documentation for haus would sit on chrome that is
 * not haus. The wordmark and logo are served from /brand/* through staticDirs
 * in main.ts.
 *
 * The accent is #7653ab, which is --haus-color-primary-default (aronia-500,
 * oklch(52% 0.138 300)) converted to hex, because Storybook's theme runs colour
 * functions that cannot read var(). It said it was that token and was #623A8F,
 * a plum from before the ramp that is nearest aronia-600 and equal to nothing.
 *
 * The two brand SVGs drew that plum and a darker one, #48296D, neither on the
 * ramp. They are aronia-600 (#5b3c89) and aronia-700 (#442a68) now, the steps
 * they were nearest, so the mark keeps its own two-tone weight and every brand
 * colour in the repository is a step of the ramp. The mark is therefore one
 * step darker than this accent, which is the primary role rather than the mark.
 */
export const hausTheme = create({
  base: 'light',

  brandTitle: 'haus',
  brandUrl: 'https://haus.hipuku.dev',
  brandImage: '/brand/wordmark.svg',
  brandTarget: '_self',

  fontBase: '"Manrope", system-ui, sans-serif',
  fontCode: '"Fira Code", ui-monospace, monospace',

  colorPrimary: '#7653ab', // aronia-500, primary-default
  colorSecondary: '#7653ab',

  appBorderRadius: 8,
})

/**
 * The docs pages in dark mode. The preview's docs container picks this one when
 * the Mode toolbar is on Dark, so the page behind the haus components is dark
 * too; on the light theme, haus's dark ink would sit on white and vanish. The
 * hex values are the dark map's roles (brand-dark.css), converted from OKLCH,
 * because the theme runs colour functions that cannot read var().
 */
export const hausDarkTheme = create({
  base: 'dark',

  brandTitle: 'haus',
  brandUrl: 'https://haus.hipuku.dev',
  brandImage: '/brand/wordmark.svg',
  brandTarget: '_self',

  fontBase: '"Manrope", system-ui, sans-serif',
  fontCode: '"Fira Code", ui-monospace, monospace',

  colorPrimary: '#d0c3ec', // aronia-300, ink-link in dark
  colorSecondary: '#d0c3ec',

  appBg: '#111113', // damson-900, surface-default
  appContentBg: '#111113',
  appPreviewBg: '#111113',
  appBorderColor: '#3f3f43', // damson-700, border-default
  textColor: '#fcfbfe', // damson-50, ink-primary
  textMutedColor: '#d1d0d7', // damson-300, ink-secondary

  appBorderRadius: 8,
})
