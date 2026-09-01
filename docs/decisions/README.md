# Decisions

The rulings this system is built on, one file each, in the order they were made.

An entry here is a decision rather than a description: it records what was
chosen, what it was chosen over, and what it costs. `docs/tokens.md` describes
the token layers as they are; these say why they are that way.

**Status is about the decision, not the code.** A decision can be settled and
unimplemented — several below are, and say so — because agreeing the contract
before writing it is the point of deciding in the open. Where a decision is not
yet true of the package, the entry names the wave that makes it true.

| # | Decision | Status |
|---|---|---|
| [0001](0001-focus-is-a-double-ring.md) | Focus is a double ring | Accepted · implemented |
| [0002](0002-surface-polarity-is-fixed.md) | Surface polarity is fixed by the contract | Accepted · implemented |
| [0003](0003-brand-and-roles-are-separate-layers.md) | The brand and the role system are separate layers | Accepted · not yet implemented |
| [0004](0004-versioning-is-1-x.md) | Versioning goes to 1.x | Accepted · not yet implemented |
| [0005](0005-variant-and-tone-are-separate.md) | `variant` and `tone` are separate props | Accepted · not yet implemented |
| [0006](0006-styles-css-declares-its-own-layer.md) | The component stylesheet declares its own cascade layer | Accepted · not yet implemented |
| [0007](0007-no-meta-package.md) | No meta-package | Accepted · implemented by doing nothing |
| [0008](0008-toast-is-presentational.md) | Toast stays presentational | Accepted · documentation pending |
| [0009](0009-classname-lands-on-the-root.md) | `className` lands on the root element | Accepted · not yet implemented |
| [0010](0010-components-are-written-in-logical-properties.md) | Components are written in logical properties | Accepted · implemented |
| [0011](0011-select-is-a-native-select.md) | `Select` is a native `<select>` | Accepted · listbox scheduled for Wave F |
