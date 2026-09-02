# 0004 · Versioning goes to 1.x

**Accepted**, 2026-09-01. **Not yet implemented**; the cut lands with the API work.

## Context

Five packages sat on 0.x. Under the caret rule a 0.x minor is treated as
breaking, so `^0.2.1` stops at the next minor: a minor cannot reach a consumer
while a patch can, which is backwards.

It had already cost something real. `haus-colour-utils` 0.3.0 refitted the hue
bins; both consumers were pinned to `^0.2.1`, neither picked it up, and the refit
sat unshipped until someone went looking.

## Decision

1.x everywhere. Carets start working and a minor reaches a consumer on their next
install.

The bump table is in `RELEASING.md`, and two entries in it are the point: a token
rename is a **major** even at an identical value, and a contrast change is a
**major** even when the hex barely moves. A token's name and its measured
contrast are both part of the contract; neither is an implementation detail.

## Consequences

Easier: the tier promise becomes explicit, and consumers stop needing a manual
bump per package per release.

Harder: breaking changes now cost a major, and the hue bins have already moved
twice. That is the trade: the discipline is the product.
