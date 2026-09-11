# 0026 · A type role binds all four of its properties in Figma

**Accepted**, 2026-09-11. **Implemented** the same day in the haus Figma file: 56 variables in `haus/semantics`, and all fourteen text styles bind size, weight, line height and letter spacing. No style's value moved. Revises how `haus#45` was resolved for text styles; the generic primitives stay deleted.

## Context

A haus type role is four tokens: `--haus-type-<role>-size`, `-weight`, `-leading` and `-tracking`. The code reads all four. The Figma file's fourteen text styles bind only the font family: size, weight, line height and letter spacing are typed.

That was deliberate, and the reason was sound. `line-height/*` was deleted from the Figma file, and `tracking/*` after it in `haus#45`, because a Figma number variable carries no unit. `tracking/widest` held `0.08`, the em value: bound to a letter-spacing field in px it means 0.08px, in percent 0.08%, and never the 8% the code means. A variable that is right in only one of the field's two units is a trap.

The cost showed up building vault's Figma components one at a time. Every text layer that is not an exact text style types its line height and letter spacing, and a typed value is one nothing checks. It also makes "does this component use a whole role" invisible in Figma, which is how vault's Badge came to take two of `label-xs`'s four properties and invent the other two without anyone noticing.

## Decision

**Each type role gets four Figma variables, and each text style binds all four.** The two that caused `haus#45` hold **pixels for that role**, not the unitless ratio:

- `type/<role>/size`, aliasing `font-size/<n>`
- `type/<role>/weight`, aliasing `font-weight/<name>`
- `type/<role>/line-height`, in px: the role's size times its leading
- `type/<role>/letter-spacing`, in px: the role's size times its tracking

`type/label-xs/letter-spacing` is `0.88`, because `label-xs` is 11px and tracks at 0.08em. That number means exactly what it says in Figma's px field, and it is only ever bound to `label-xs`, so the objection in `haus#45` does not arise: the unit problem belonged to a primitive shared by roles of different sizes, and these are per role.

The generic `line-height/*` and `tracking/*` primitives stay deleted.

## Consequences

- Fourteen roles, 56 variables in `haus/semantics`. They are derived values, so they are generated from `semantics.css` and `primitives.css` rather than typed, and a test holds them equal to what the CSS computes.
- Each variable's Web codeSyntax names the CSS token it mirrors (`var(--haus-type-label-xs-tracking)`), with a description saying the Figma value is in px at that role's size.
- A component that uses a whole role applies the text style and types nothing. A component that does not is visible as the one with typed type, which is the point.
- Brands that change a role's size or leading would change these values; no brand does today.

## Rejected

**Put the unitless values back and trust the field's unit.** That is `haus#45` again.

**Leave it typed.** It keeps the file honest about units and leaves every component's type unchecked. The per-role px values remove the reason it was typed.
