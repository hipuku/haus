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
 * a design for, and says so in its own type: `Toggle` takes `sm | md` of the
 * size scale for the same reason. Narrowing is honest; inventing a colour to
 * satisfy a type is not.
 *
 * Button took `neutral | error` until it was checked. `semantics.css` already
 * carried the full six-role set for info, success and warning, so the narrowing
 * described a design that existed. It takes all five now, and its stylesheet
 * remaps eleven to thirteen properties per tone.
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
