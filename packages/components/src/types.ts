/**
 * The vocabulary every component shares, so a consumer who learns one can guess
 * the next. Ruling A5, `docs/decisions/0005-variant-and-tone-are-separate.md`.
 *
 * Before this, `variant` meant three different things: visual weight on Button,
 * elevation on Card, semantics on Badge and Toast — and Button said `danger`
 * where Badge and Toast said `error`. One word for three concepts, and two words
 * for one.
 */

/**
 * What a thing *means*. Never how heavy it looks.
 *
 * The union is the whole vocabulary. A component narrows it to the tones it has
 * a design for, and says so in its own type — `neutral | error` on Button today,
 * because the other three do not exist as button styles yet. Narrowing is
 * honest; inventing three more button colours to satisfy a type is not.
 */
export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'error'

/** How solidly a tone is expressed. Fill, not meaning. */
export type Appearance = 'subtle' | 'solid'

/**
 * The size scale. Avatar keeps `xs` and `xl` as a documented extension: it is a
 * picture rather than a control, and a 16px avatar has a use a 16px button does
 * not.
 */
export type Size = 'sm' | 'md' | 'lg'
