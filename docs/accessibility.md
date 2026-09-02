# Accessibility

What this system does, what it does not, and where it is known to fall short.

Written because the opposite was true for a long time: haus did real
accessibility work and claimed none of it, while also not disclosing the two
places it fails. A statement that only lists successes is marketing.

## What is checked, and by what

| Claim | Checked by |
|---|---|
| Every component has no axe violations | `vitest-axe`, in all 12 component suites |
| Every surface pairs with an ink that clears AA | `contrast.test.ts`, measured with `haus-colour-utils` |
| The focus ring clears SC 1.4.11 at 3:1 | the same file, against three surfaces |
| Focus is visible in forced-colors mode | `logical-properties.test.ts`, per component |
| Controls are operable from the keyboard | Space, arrows and tab-stop tests |
| A dialog traps focus **and gives it back** | `Modal.test.tsx` |
| Hints describe rather than rename | `toHaveAccessibleName` / `toHaveAccessibleDescription` |
| Components render with no DOM | `ssr.test.tsx`, in a node environment |

The point of the table is the second column. Every row is an assertion that
fails if the claim stops being true, rather than a sentence someone remembered
to keep updating.

## Two known failures, disclosed

**`<Button size="sm">` is below the WCAG 2.5.8 target size.** `--haus-control-height-sm`
is 28px, and 2.5.8 asks for 24×24 with no spacing exception. It ships by
default, with no gate. It is a pointer-density size that should not be used for
a primary target on touch, and that is a disclosure rather than a defence: the
right fix is either a floor on the token or a documented spacing requirement
around the control, and neither has been done.

**`Select`'s open list is not themed and cannot be.** It is a native `<select>`,
so the popup is drawn by the operating system. That is a deliberate trade, in
[decision 0011](decisions/0011-select-is-a-native-select.md). What the platform
gives back is keyboard handling that is correct everywhere, a wheel picker on
iOS, and assistive behaviour a custom listbox has to reimplement and then keep
correct.

## Two things that are the consumer's

**Toast is presentational.** No provider, no queue, no positioning, no timer.
See [decision 0008](decisions/0008-toast-is-presentational.md). It carries its own
`role="status"`, so a notice dropped into your container is announced; where it
appears, how many stack and for how long are yours.

**Contrast is decided at the token layer.** Every surface has a paired `on-*`
ink and those pairs are measured. Reach past a role to a primitive and you have
left that guarantee behind, which is what the tier guard in `haus-components`
exists to catch.

## Focus

One treatment, everywhere: a double ring, `0 0 0 2px <surface>, 0 0 0 4px <focus>`,
in [decision 0001](decisions/0001-focus-is-a-double-ring.md). The inner band is
the element's own backdrop, so the ring reads on a card and on the page without
a second variant, and the outer band is the accent at full strength, because
alpha is what made the alternatives fail.

Every ring is a `box-shadow`, and forced-colors mode drops box-shadows outright,
so each component also carries a `@media (forced-colors: active)` fallback
outlining in the system's own `Highlight`. It could not be one global rule:
Checkbox, Radio and Toggle draw the ring on a **sibling** of a visually hidden
input, so a blanket `:focus-visible` outline would land on an element nobody can
see.

Rings appear for the keyboard. Text fields still ring on click, because
`:focus-visible` matches them there by the browser's own heuristic.

## What is not covered

- **No screen reader has been run against this.** Everything above is automated,
  and automated checks find perhaps a third of what a real audit finds. The tests
  say the markup is right; they cannot say the experience is good.
- **No right-to-left rendering test.** The components are written in logical
  properties and a source guard holds them there, but the component suite runs
  with `css: false`, so nothing here reads a computed style. A right-to-left
  story under a visual diff is the missing half.
- **No reduced-motion audit.** Components honour `prefers-reduced-motion` where
  they animate; nothing checks that they all do.
- **Nothing proves a state is distinguishable without colour.** Status is
  carried by tone and by an icon in Toast and Badge, and no test checks that the
  icon is doing that work.
