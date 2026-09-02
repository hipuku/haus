# 0003 · The brand and the role system are separate layers

**Accepted**, 2026-09-01. **Not yet implemented**; it is the substance of Wave B.
The full contract is `docs/theming.md`.

## Context

`README.md` said theming lived entirely in `semantics.css` and `DESIGN.md` said a
theme swap was a single-file change with zero component edits. Neither was true.
A search for `data-theme`, `:root[` or any scoping selector returned nothing:
every token sat on a bare `:root`, unprefixed, so `--space-4` and `--text-14`
were in the global namespace where a consumer running Tailwind collides with
them. There was no exported theme-contract type and no example brand.

Two products had already answered the question this raises. Vault declared 159
custom properties of its own. Core, whose first commit came after all five
packages were on npm, declared 56 of its own and took no dependency on the
token tier at all. Same author, both with the alternative available.

The role layer is not what they rejected. Of Vault's 40 differing values, six
differ only by decimal padding, about thirty are palette-name swaps, and roughly
eight are structural. The roles work. **The brand is the part that cannot move.**

## Decision

Split them. A fourth cascade layer for the brand map, `--haus-` on every property
at every layer, a `data-haus-theme` scoping selector, a generated TypeScript map
type so a consumer knows what they must supply, and one complete worked example
brand shipped beside the default.

## Consequences

Easier: the thing the README already claimed becomes true, and a consumer owns
exactly one file.

Harder: it is breaking for anyone reading the tokens, which is why it lands with
the 1.x cut and a migration guide rather than on its own.

**One worked example does not prove a contract.** This decision is not
demonstrated until a second brand map exists on a codebase that was not written
to flatter it. Vault's adoption is the first honest test, and the running note
of every moment someone wants to reach past the role layer is the acceptance
criterion.
