# 0016 · A restated value is a copy, and the package is what says so

**Accepted**, 2026-09-08. **Implemented as `findRestatedTokens` in
`haus-tokens/guard`.** `haus#53`.

## Context

`haus-tokens/guard` already shipped `findUndefinedTokens`, from
[`haus#19`](https://github.com/hipuku/haus/issues/19): a property read and
defined nowhere. That failure is invisible, because `var(--x)` for an undefined
`--x` drops the declaration silently.

**There is a second invisible failure and the package could see it too.** A
consumer that declares a property this package already declares, at the value
this package already gives, has a copy. It renders perfectly. It is wrong only
from the moment one of the two sides moves, and nothing anywhere reports the
window in between.

Both consumers had it, and only one was told:

- **vault** carried 141 restated values, closed them as `vault#25`, and **wrote
  the rule by hand** in `test/tokens.test.ts` so they could not come back
- **drift** carries **89 of 148 shared roles** and never had the rule. It was
  written in the repository next door and never ported

**A guard that exists in one consumer is not a guard, it is a habit.** The
contract is defined here, so the check belongs here, which is the same argument
`haus#19` already won for the undefined case.

## The kind a hand-written version missed

vault's rule compares declaration text. That finds the first kind and not the
second:

| Kind | Shape | drift's count |
|---|---|---|
| `identical` | the same text on both sides. `--haus-space-inset-md: var(--haus-space-4)` written twice | **77** |
| `resolved` | the text differs and the value does not. `--haus-z-modal: 400` against `var(--haus-z-400)`, where `--haus-z-400` is `400` | **12** |

**The second kind is the interesting one, because it is how a consumer opts out
of a scale while appearing to be on it.** Every one of drift's twelve is a
`z-index`, `opacity` or `border-width` role written as the literal the haus
primitive resolves to. Read as text they look like decisions. Resolved they are
the same number.

That distinction is not academic: it was the difference between *drift
re-decides nineteen non-colour things* and *drift re-decides five*, and the
first version of `haus#53` was scoped on the wrong one.

## Decision

**`findRestatedTokens({ defines, upstream })`, returning every declaration this
package already ships, tagged `identical` or `resolved`.**

An empty array is the assertion. A consumer may override any role it likes, and
several should. What it may not do is override a role to the value the package
already gives.

Values are normalised before comparison, comments stripped and whitespace
flattened, so a copy cannot hide behind spelling. The resolver is depth-limited
rather than cycle-tracked: a token graph is shallow, and hitting the limit
returns a partially resolved value that compares unequal, so a cycle reports
nothing. **A guard that guesses is worse than one that misses.**

## Which files are `upstream` is the question being asked

The one judgement a caller has to make, and it is worth stating because the
answer changes the number.

Measured against drift: **143 restatements with `brand.css` in `upstream`, 89
without.** The 54 in the gap are exactly its colour overrides, which are a brand
written as role overrides.

- **Include `brand.css`** and the question is *does this consumer restate
  anything we ship, our brand's colour choices included*
- **Leave it out** and the question is *does it restate anything structural*,
  with its own palette treated as its business

So a consumer with a brand file, or intending one, leaves it out. A consumer with
no brand of its own puts it in and learns that its colour overrides agree with
ours, which is a different and also useful thing.

## Verified against real code, not a fixture

The unit tests cover both kinds, a real override, an unknown property, spelling,
repeat declarations and a reference cycle. **The check that matters is that it
was run against drift's actual `semantics.css` and reproduced, independently, the
count arrived at by hand: 89, as 77 identical and 12 resolved, and the twelve
named are the twelve.**

A guard agreeing with the measurement that motivated it is weak evidence on its
own. It is worth something here because the hand count came first, from a
different method, and the resolver found the same twelve without being told what
to look for.

## Consequences

`D1` deletes drift's 89 and this is what proves the deletion complete, rather
than a diff read by a person.

**vault's hand-written rule should be replaced by this one**, which is not
cosmetic: vault's compares text, so it is blind to the `resolved` kind, and vault
has never been checked for it.

The guard stays pure and takes CSS as strings. It reads no files and gains no
dependency on `node:fs`, so it runs in a Vitest suite, a Node script, a build
step or a browser.
