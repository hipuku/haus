import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

/**
 * Every story, rendered in a real browser, checked by axe and compared against a
 * screenshot, in light and in dark.
 *
 * The component suites run under `css: false`, so axe there sees no colour at
 * all and a contrast failure cannot fire. These run the same stories with the
 * stylesheet on, which is the only place a contrast pair is measurable, and
 * `a11y: { test: 'error' }` in `preview.ts` turns a violation into a failure.
 *
 * One project per mode, rather than one project rendering twice. The mode is a
 * toolbar global, and the plugin's `initialGlobals` pins it for a whole project,
 * so each story is one test per mode with its own name, its own screenshot and
 * its own axe run. A failure says which mode it was in without reading the
 * message.
 */
const MODES = ['light', 'dark'] as const

/**
 * Screenshots carry the platform in their filename, which is Vitest's default
 * and is right: a font renders differently on macOS and on Linux, so one file
 * cannot serve both. Only the Linux images are committed, and CI is the gate.
 * A local run on another platform writes and compares its own set, which is
 * useful while working and is ignored by git, so it can never be the thing that
 * passes a change.
 *
 * **The CI runner is the authority for the committed images.** They were first
 * generated in the Playwright container for the version the Stories job
 * installs, which got 168 of 198 to match and is not the same thing: the runner
 * laid one specimen page out 6px shorter, which is a text measurement
 * difference and not antialiasing, and a dimension mismatch fails before any
 * threshold applies. So the loop is: change the code, let the Stories job fail,
 * take the references it wrote from its artifact, commit those. The threshold
 * below stays where it is; loosening it would not have helped, because the
 * images were a different size.
 */
async function modeProject(mode: (typeof MODES)[number]) {
  return {
    plugins: await storybookTest({
      configDir: '.storybook',
      storybookScript: 'pnpm run storybook --ci',
      initialGlobals: { mode },
    }),
    test: {
      name: `storybook-${mode}`,
      setupFiles: ['./.storybook/vitest.setup.ts'],
      browser: {
        enabled: true,
        headless: true,
        provider: playwright(),
        // One browser. A second would double the run for differences this
        // system does not make claims about; forced colours and reduced motion
        // are covered by their own tests rather than by another engine.
        instances: [{ browser: 'chromium' as const }],
        // The viewport is Vitest's default, 1200x900, and is left alone on
        // purpose. Setting it here or on the instance is accepted and ignored
        // under the Storybook plugin, and a setting that does nothing is worse
        // than none: measured, both produced 1200x900 images while the config
        // said 1280x800. The default is the same number everywhere, which is
        // all a screenshot needs.
        screenshotFailures: false,
        expect: {
          toMatchScreenshot: {
            screenshotDirectory: `__screenshots__/${mode}`,
            comparatorName: 'pixelmatch' as const,
            // One pixel in a thousand, of the story's own box rather than of
            // the window. Text antialiasing moves a handful of subpixels
            // between runs on the same machine and a threshold of zero turns
            // that into a flake, while a real change moves far more. Measured
            // against the window this was too loose to be a gate: a padding
            // change on one small badge moved under a thousandth of a
            // 1200x900 canvas and two of its four stories passed.
            comparatorOptions: { allowedMismatchedPixelRatio: 0.001 },
          },
        },
      },
    },
  }
}

export default defineConfig(async () => ({
  test: {
    projects: await Promise.all(MODES.map(modeProject)),
  },
}))
