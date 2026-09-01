/* ─── haus / primitives ──────────────────────────────────────────────────────
   Raw values only. No component or semantic meaning.
   Nothing outside this file should define raw values.
   Components must never reference these directly. Use semantics.css.

   GENERATED FROM src/tokens.json. Do not edit.
   Regenerate with `npm run tokens`; `npm run tokens:check` fails CI if stale.
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * Every entry a brand must supply, generated from brand.css.
 *
 * A brand file is CSS, so this cannot check it directly. What it does check is
 * the object form: build a brand in TypeScript, satisfy this type, and a missing
 * or misspelled role is a compile error rather than an unresolved var() that
 * drops a declaration with no warning at all.
 */
export interface BrandMap {
  '--haus-brand-surface-default': string
  '--haus-brand-surface-subtle': string
  '--haus-brand-surface-raised': string
  '--haus-brand-surface-overlay': string
  '--haus-brand-surface-sunken': string
  '--haus-brand-surface-inverse': string
  '--haus-brand-surface-disabled': string
  '--haus-brand-surface-inverse-hover': string
  '--haus-brand-ink-primary': string
  '--haus-brand-ink-secondary': string
  '--haus-brand-ink-tertiary': string
  '--haus-brand-ink-disabled': string
  '--haus-brand-ink-inverse': string
  '--haus-brand-ink-link': string
  '--haus-brand-ink-on-aronia': string
  '--haus-brand-border-subtle': string
  '--haus-brand-border-default': string
  '--haus-brand-border-strong': string
  '--haus-brand-border-disabled': string
  '--haus-brand-border-inverse': string
  '--haus-brand-border-inverse-hover': string
  '--haus-brand-primary-default': string
  '--haus-brand-primary-hover': string
  '--haus-brand-primary-pressed': string
  '--haus-brand-primary-subtle': string
  '--haus-brand-primary-on-subtle': string
  '--haus-brand-primary-disabled': string
  '--haus-brand-info-subtle': string
  '--haus-brand-info-border': string
  '--haus-brand-info-default': string
  '--haus-brand-info-on-subtle': string
  '--haus-brand-info-on-default': string
  '--haus-brand-info-emphasis': string
  '--haus-brand-success-subtle': string
  '--haus-brand-success-border': string
  '--haus-brand-success-default': string
  '--haus-brand-success-on-subtle': string
  '--haus-brand-success-on-default': string
  '--haus-brand-success-solid': string
  '--haus-brand-success-emphasis': string
  '--haus-brand-warning-subtle': string
  '--haus-brand-warning-border': string
  '--haus-brand-warning-default': string
  '--haus-brand-warning-on-subtle': string
  '--haus-brand-warning-on-default': string
  '--haus-brand-warning-solid': string
  '--haus-brand-warning-emphasis': string
  '--haus-brand-error-subtle': string
  '--haus-brand-error-border': string
  '--haus-brand-error-default': string
  '--haus-brand-error-on-subtle': string
  '--haus-brand-error-on-default': string
  '--haus-brand-error-emphasis': string
  '--haus-brand-backdrop': string
}

/** The role names themselves, for anyone generating a brand rather than writing one. */
export const brandRoles = [
  '--haus-brand-surface-default',
  '--haus-brand-surface-subtle',
  '--haus-brand-surface-raised',
  '--haus-brand-surface-overlay',
  '--haus-brand-surface-sunken',
  '--haus-brand-surface-inverse',
  '--haus-brand-surface-disabled',
  '--haus-brand-surface-inverse-hover',
  '--haus-brand-ink-primary',
  '--haus-brand-ink-secondary',
  '--haus-brand-ink-tertiary',
  '--haus-brand-ink-disabled',
  '--haus-brand-ink-inverse',
  '--haus-brand-ink-link',
  '--haus-brand-ink-on-aronia',
  '--haus-brand-border-subtle',
  '--haus-brand-border-default',
  '--haus-brand-border-strong',
  '--haus-brand-border-disabled',
  '--haus-brand-border-inverse',
  '--haus-brand-border-inverse-hover',
  '--haus-brand-primary-default',
  '--haus-brand-primary-hover',
  '--haus-brand-primary-pressed',
  '--haus-brand-primary-subtle',
  '--haus-brand-primary-on-subtle',
  '--haus-brand-primary-disabled',
  '--haus-brand-info-subtle',
  '--haus-brand-info-border',
  '--haus-brand-info-default',
  '--haus-brand-info-on-subtle',
  '--haus-brand-info-on-default',
  '--haus-brand-info-emphasis',
  '--haus-brand-success-subtle',
  '--haus-brand-success-border',
  '--haus-brand-success-default',
  '--haus-brand-success-on-subtle',
  '--haus-brand-success-on-default',
  '--haus-brand-success-solid',
  '--haus-brand-success-emphasis',
  '--haus-brand-warning-subtle',
  '--haus-brand-warning-border',
  '--haus-brand-warning-default',
  '--haus-brand-warning-on-subtle',
  '--haus-brand-warning-on-default',
  '--haus-brand-warning-solid',
  '--haus-brand-warning-emphasis',
  '--haus-brand-error-subtle',
  '--haus-brand-error-border',
  '--haus-brand-error-default',
  '--haus-brand-error-on-subtle',
  '--haus-brand-error-on-default',
  '--haus-brand-error-emphasis',
  '--haus-brand-backdrop',
] as const
