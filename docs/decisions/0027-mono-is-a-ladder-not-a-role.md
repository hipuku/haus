# 0027 · Mono is a ladder, not a role

**2026-09-13.** Accepted.

## The finding

`--haus-type-mono-*` was one role: 13 / regular / 1.6 / 0.

vault reads `--haus-font-mono` in **21 places** and not one took it. `--haus-type-mono-size` had no consumer in that repo at all. The sizes were `text-11` four times, `text-12` thirteen times and `text-13` four times, each inventing or inheriting its own leading.

That looks like the defect the vault component audit found a dozen times, a component taking part of a role and making up the rest. It is not. The sizes are not drift: **they are doing different jobs.** A token name in a drawer is 11, a hex value in a card is 12, a numeric field in the step editor is 13. Moving all 21 onto 13 would resize values across cards, drawers, tables and the export panel, and would be wrong as well as visible.

haus had one mono role where a ladder is wanted. Labels already work this way, `label-xs` 11, `label-sm` 12, `label-md` 13, and vault's mono sizes land on exactly those three.

## The decision

Three roles, each binding all four properties per decision 0026:

| Role | Size | Weight | Leading | Tracking |
|---|---|---|---|---|
| `mono-xs` | 11 | regular | `leading-normal` 1.4 | normal |
| `mono-sm` | 12 | regular | `leading-relaxed` 1.5 | normal |
| `mono-md` | 13 | regular | `leading-loose` 1.6 | normal |

**The leading loosens as the size grows**, because the larger the mono the more block-like the content: a chip or a value wants a tight box, a code panel wants air. `mono-sm`'s 1.5 is what vault's export panel already computes; `mono-md` keeps the old role's 1.6 exactly.

`--haus-type-mono-*` stays, defined as `mono-md`'s alias. Nothing that reads it moves, and Storybook's token pages read it in several places. New code takes a rung.

## What it costs

Nothing moves on screen. Every existing consumer resolves to the same four values it did before, because the alias is `mono-md` and `mono-md` is the old role.

## What it unblocks

Five of vault's molecules are mono: `CopyButton`, `ContrastChip`, `StepEditControl`, `FontPreviewControl`, `UnitsControl`. Each would otherwise bind family, size and colour and type its leading, which is rule 4 of the Figma practice working correctly but is a typed value per component for no reason. With a rung to take, each takes the whole role and types nothing.

## Rejected

- **Moving the 21 usages onto the single 13 role.** Visible everywhere and wrong: the sizes mean different things.
- **Leaving it and typing the leading per component.** That is the status quo, and it makes each consumer restate a decision haus should own.
- **One leading for all three rungs.** Tried on paper: 1.6 makes an 11px chip tall and loose, 1.4 makes a code panel cramped.
