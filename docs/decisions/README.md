# Decisions

The rulings this system is built on, one file each, in the order they were made.

An entry here is a decision rather than a description: it records what was
chosen, what it was chosen over, and what it costs. `docs/tokens.md` describes
the token layers as they are; these say why they are that way.

**Status is about the decision rather than the code.** A decision can be settled
and unimplemented. Several below were, 0012 still is in part, and each says so,
because agreeing the contract before writing it is the point of deciding in the
open. Where a decision is not
yet true of the package, the entry names the wave that makes it true.

| # | Decision | Status |
|---|---|---|
| [0001](0001-focus-is-a-double-ring.md) | Focus is a double ring | Accepted · implemented |
| [0002](0002-surface-polarity-is-fixed.md) | Surface polarity is fixed by the contract | Accepted · implemented |
| [0003](0003-brand-and-roles-are-separate-layers.md) | The brand and the role system are separate layers | Accepted · implemented |
| [0004](0004-versioning-is-1-x.md) | Versioning goes to 1.x | Accepted · implemented at 1.0.0 |
| [0005](0005-variant-and-tone-are-separate.md) | `variant` and `tone` are separate props | Accepted · implemented |
| [0006](0006-styles-css-declares-its-own-layer.md) | The component stylesheet declares its own cascade layer | Accepted · implemented |
| [0007](0007-no-meta-package.md) | No meta-package | Accepted · implemented by doing nothing |
| [0008](0008-toast-is-presentational.md) | Toast stays presentational | Accepted · implemented |
| [0009](0009-classname-lands-on-the-root.md) | `className` lands on the root element | Accepted · implemented |
| [0010](0010-components-are-written-in-logical-properties.md) | Components are written in logical properties | Accepted · implemented |
| [0011](0011-select-is-a-native-select.md) | `Select` is a native `<select>` | ⏳ Superseded by 0025 |
| [0012](0012-a-tone-declares-custom-properties-only.md) | A tone rule declares custom properties only | Accepted · Button and Toast; Badge pending |
| [0013](0013-a-component-is-promoted-on-evidence.md) | A component is promoted on evidence, not on taste | Accepted · implemented as the six added in 1.0 |
| [0014](0014-the-brand-contract-is-tiered.md) | The brand contract is tiered: base required, feedback optional | Accepted · implemented |
| [0015](0015-a-brand-states-form-not-only-colour.md) | A brand states form as well as colour, and form is four things | Accepted · implemented |
| [0016](0016-a-restated-value-is-a-copy-and-the-package-says-so.md) | A restated value is a copy, and the package is what says so | Accepted · implemented |
| [0017](0017-the-nineteenth-component-is-a-busy-indicator.md) | The nineteenth component is a busy indicator, and nothing else qualifies | Accepted · implemented as `Spinner` |
| [0018](0018-vaults-twenty-are-settled-one-at-a-time.md) | vault's twenty local tokens, settled one at a time | Accepted · implemented, both sides |
| [0019](0019-typeface-is-a-form-tier-brand-entry.md) | Typeface is a form-tier brand entry, and moving it is a major | Accepted · implemented, ships in haus-tokens 3.0.0 |
| [0020](0020-listbox-and-select-both-stay.md) | Listbox and Select both stay, and Select's lack of consumers is recorded | ⏳ Superseded by 0025 |
| [0021](0021-decision-states-are-badge-tones.md) | A product's domain states spend Badge's tones, superseding C1 | Accepted · implemented, core took it in C3 |
| [0022](0022-ownership-is-stated-in-both-directions.md) | Ownership is stated, in both directions | Accepted · implemented on Button, IconButton, Card and Tabs |
| [0023](0023-a-union-prop-type-exports-its-halves.md) | A union prop type exports its halves | Accepted · implemented for all four union types |
| [0024](0024-the-rsc-path-is-guarded-by-its-rule.md) | The RSC path is guarded by its rule, not by a harness | Accepted · implemented |
| [0025](0025-select-is-the-themed-control.md) | Select is the themed control, and the native select is retired | Accepted · supersedes 0011 and 0020 |
| [0026](0026-a-type-role-binds-all-four-properties-in-figma.md) | A type role binds all four of its properties in Figma | Accepted · implemented in the Figma file |
