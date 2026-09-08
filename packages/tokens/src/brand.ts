/* ─── haus / primitives ──────────────────────────────────────────────────────
   Raw values only. No component or semantic meaning.
   Nothing outside this file should define raw values.
   Components must never reference these directly. Use semantics.css.

   GENERATED FROM src/tokens.json. Do not edit.
   Regenerate with `npm run tokens`; `npm run tokens:check` fails CI if stale.
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * The entries every brand must supply, generated from brand.css.
 *
 * A brand file is CSS, so this cannot check it directly. What it does check is
 * the object form: build a brand in TypeScript, satisfy this type, and a missing
 * or misspelled role is a compile error rather than an unresolved var() that
 * drops a declaration with no warning at all.
 */
export interface BrandMapBase {
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
  '--haus-brand-ink-on-primary': string
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
  '--haus-brand-backdrop': string
}

/**
 * The optional half: info, success, warning and error.
 *
 * A product whose statuses are not those four semantics omits this tier and
 * inherits haus's from :root, because custom properties inherit and a named
 * brand only overrides what it declares. Optional here, and all-or-nothing per
 * ramp in brand.test.ts, which types cannot express.
 */
export interface BrandMapFeedback {
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
}

/**
 * The other optional half: what a product re-decides that is not a colour.
 *
 * Radius and elevation, taken from what drift and vault actually changed. Not
 * z-index, opacity, border-width or spacing: nobody re-decides those, and the
 * overrides that looked like it were the literal values of haus's own
 * primitives typed out. All-or-nothing per group, in brand.test.ts.
 */
export interface BrandMapForm {
  '--haus-brand-radius-control': string
  '--haus-brand-radius-surface': string
  '--haus-brand-radius-overlay': string
  '--haus-brand-radius-marker': string
  '--haus-brand-elevation-raised': string
  '--haus-brand-elevation-floating': string
  '--haus-brand-elevation-overlay': string
  '--haus-brand-modal-width-sm': string
  '--haus-brand-modal-width-md': string
  '--haus-brand-modal-width-lg': string
}

/** A complete brand: the base tier, and as much of the optional tiers as applies. */
export type BrandMap = BrandMapBase & Partial<BrandMapFeedback> & Partial<BrandMapForm>

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
  '--haus-brand-ink-on-primary',
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
  '--haus-brand-backdrop',
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
  '--haus-brand-radius-control',
  '--haus-brand-radius-surface',
  '--haus-brand-radius-overlay',
  '--haus-brand-radius-marker',
  '--haus-brand-elevation-raised',
  '--haus-brand-elevation-floating',
  '--haus-brand-elevation-overlay',
  '--haus-brand-modal-width-sm',
  '--haus-brand-modal-width-md',
  '--haus-brand-modal-width-lg',
] as const

/** The required half. A brand supplying fewer than these renders unstyled. */
export const brandRolesBase = [
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
  '--haus-brand-ink-on-primary',
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
  '--haus-brand-backdrop',
] as const

/** The optional colour half, grouped by the ramp that has to be complete or absent. */
export const brandRolesFeedback = [
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
] as const

/** The optional non-colour half: radius and elevation. */
export const brandRolesForm = [
  '--haus-brand-radius-control',
  '--haus-brand-radius-surface',
  '--haus-brand-radius-overlay',
  '--haus-brand-radius-marker',
  '--haus-brand-elevation-raised',
  '--haus-brand-elevation-floating',
  '--haus-brand-elevation-overlay',
  '--haus-brand-modal-width-sm',
  '--haus-brand-modal-width-md',
  '--haus-brand-modal-width-lg',
] as const
