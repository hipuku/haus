# 0005 · `variant` and `tone` are separate props

**Accepted**, 2026-09-01. **Not yet implemented.**

## Context

`variant` meant three different things. On Button it mixed visual weight,
semantics and behaviour in one union — `primary | secondary | ghost | danger |
text | external` — where `external` also injected a glyph. On Card it meant
elevation. On Badge it meant semantics, with fill split out into `appearance`.
Button said `danger` where Badge and Toast said `error`. No `tone` prop existed
anywhere.

Four size vocabularies were in use, six components had none, and Input and Select
`Omit`ed the native `size` attribute while offering no replacement.

## Decision

- `variant` is **visual weight only**.
- `tone` is `neutral | info | success | warning | error`, everywhere. `danger`
  becomes `error`.
- `appearance` is `subtle | solid`, and Toast gains it.
- Button's `external` becomes its own prop, because it is behaviour plus a glyph
  rather than a look.
- Sizes converge on `sm | md | lg`, with Avatar keeping `xs` and `xl` as a
  documented extension rather than a fourth vocabulary.

## Consequences

Easier: one word per concept, and a consumer who learns Badge can guess Toast.

Harder: it renames props across most of the library, so it is the majority of the
1.x migration guide. It is worth doing in the same major as the token split
rather than making consumers migrate twice.
