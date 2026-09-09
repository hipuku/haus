# 0023 · A union prop type exports its halves

**Accepted**, 2026-09-09. **Implemented** for `Button` in `haus-components`.
`haus#66`. Follows [0022](0022-ownership-is-stated-in-both-directions.md).

## Context

`ButtonProps` became a discriminated union in 2.1.0 so that `asChild` could
forbid `loading`, `href` and `target`. Forbidding them is right:
`<Button asChild loading>` announces a wait that will never end, and the child
carries its own destination.

**It works for callers and breaks wrappers.**

```tsx
function SubmitButton({ children, ...rest }: ButtonProps & { pendingLabel?: string }) {
  return <Button {...rest}>{children}</Button>   // does not compile
}
```

The compiler cannot rule out the `asChild` branch, whose `children` is a single
`React.ReactElement`, so a wrapper that renders an icon beside a label is
rejected **even though it never passes `asChild` and could not**.

Both of core's wrappers hit it on upgrading to 2.1.1: `SubmitButton`, which adds
a `pendingLabel`, and `ConnectGithubButton`, which renders a mark beside a label.

## The thing worth noticing

core got out with:

```ts
type ButtonOwnProps = Extract<ButtonProps, { asChild?: false }>
```

That is the right *meaning*. A wrapper is a button, never a cloned child. It is
also **a type this package should have shipped**: every consumer that writes a
wrapper will rediscover the same `Extract`, spell it differently, and keep it in
step by hand. A union is easy to produce and hard to accept, and the package that
produced it is the one that should say what its halves are called.

## Decision

**A prop type that is a union exports each half by name, alongside the union.**

`Button` exports `ButtonOwnProps` and `ButtonAsChildProps` beside `ButtonProps`.
The union is now written *from* the halves rather than the halves being extracted
back out of it, so there is one declaration per half and no `Extract` on either
side of the boundary.

This is not only about `Button`. [0022](0022-ownership-is-stated-in-both-directions.md)
puts `asChild` on `IconButton` and `Card` next, and each will produce the same
union and owe the same two names.

**The naming is `<Component>OwnProps` and `<Component>AsChildProps`**, because the
distinction the union draws is whether the component renders its own element.

## What it costs

Two more names in the public API per component that has a union, and two more
things a major version has to keep. That is the cost of the union itself, made
visible rather than pushed onto consumers.

**It is also two more type exports the barrels must forward**, which used to be a
hand-maintained list and is now checked: `barrel.test.ts` reads each component's
source and asserts every exported type is re-exported by both barrels. Those
checks passed on the two new names without being edited, which is the check
doing its job on the first change after it was written.

## Alternatives considered

**Leave it, and let consumers write `Extract`.** Rejected. It is a workaround
that works, which is the kind most likely to be silently copied into every
consumer and then diverge.

**Make `ButtonProps` accept the wrapper case by widening `children` on the
`asChild` half.** Rejected outright: that is deleting the constraint the union
exists to express, to fix a symptom. `asChild` clones a single element and there
is no correct behaviour for two.

**Ship a separate `ButtonWrapperProps` alias.** Rejected as a third name for a
thing that already has two halves; the halves are the honest decomposition.
