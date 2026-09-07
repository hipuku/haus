import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  staticDirs: [
    { from: '../../../logo.svg', to: '/brand/logo.svg' },
    { from: '../../../wordmark.svg', to: '/brand/wordmark.svg' },
  ],
  // essentials and interactions are gone as packages: controls, actions,
  // viewport, backgrounds, toolbars, measure, outline and the interaction
  // runner all moved into the core `storybook` package in 9. Listing them here
  // is now an error rather than a no-op.
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@chromatic-com/storybook',
  ],
  // A published reference site, not a working Storybook: suppress the onboarding
  // checklist and update toasts, which are noise for a visitor here to read the
  // system and have no local project to onboard to.
  core: {
    disableWhatsNewNotifications: true,
    disableTelemetry: true,
  },
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // `docs.autodocs` is gone. Tagging a meta with `autodocs` is the whole
  // mechanism now, which is what it always meant here — the option said "only
  // tagged components get docs" and nothing was tagged, so this generated
  // nothing at all.
}

export default config
