# 0007 · No meta-package

**Accepted**, 2026-09-01.

## Context

A consumer wanting the token layer, the components and the colour maths tracks
four version lines that are only ever released together in practice. The obvious
convenience is a `haus` meta-package depending on a compatible set at exact
versions, so a consumer takes one version instead of four.

## Decision

No meta-package. Four version lines, released independently.

## Consequences

The convenience was worth less than it looked. [0004](0004-versioning-is-1-x.md)
already fixed what motivated it: under 1.x a caret works and a minor reaches a
consumer on their next install, so the pain being solved was mostly the caret
rule rather than the package count.

What is left is a sixth package on the release path and a second place a version
is stated — two sources of truth for the same fact, which is the failure mode
this project keeps paying for elsewhere.

Tier-per-package is also what a tiered system should look like from outside. One
bundled version line says the tiers cannot be released independently, which would
be a claim about the architecture that is not true.
