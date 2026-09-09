import React from 'react'

/**
 * The `asChild` mechanics, in one place.
 *
 * Decision 0022 puts `asChild` on more than one component, and `mergeRefs` is
 * the function `haus#71` shipped a defect in. **Copying it per component would
 * restate the exact code that produced the worst bug this package has had**,
 * with nothing keeping the copies in step, which is the defect this whole
 * design system exists to detect. So it lives here and every `asChild` calls it.
 */

/**
 * Applies a node to however many refs were aimed at it.
 *
 * `asChild` has two: the one the caller put on the component and the one they
 * put on the child. Cloning with only the component's silently discards the
 * child's, which is what the ref test caught. Neither is more entitled than the
 * other, so both are called.
 *
 * React 19 passes `ref` as an ordinary prop and React 18 keeps it on the
 * element, and this package's peer range allows both, so the child's ref is
 * read from whichever place holds it.
 */
export function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> | undefined {
  const real = refs.filter(Boolean)
  /* Nothing to merge means no ref at all, not a callback that does nothing.
     A ref is illegal in a Server Component, and `asChild` is the one path that
     could attach one without being asked: core renders `<Button asChild>` from
     two server pages, where neither the component nor the child has a ref, and
     an unconditional callback made both throw "Refs cannot be used in Server
     Components". haus#71, and `rsc-rules.test.tsx` is what holds it now. */
  if (real.length === 0) return undefined
  return (node) => {
    for (const ref of real) {
      if (typeof ref === 'function') ref(node)
      else (ref as React.MutableRefObject<T | null>).current = node
    }
  }
}

/**
 * The ref a child element carries, from wherever this React version keeps it.
 *
 * React 19 puts it in props; React 18 keeps it on the element. The peer range
 * allows both, so look in both.
 */
export function childRefOf(child: React.ReactElement): React.Ref<unknown> | undefined {
  const fromProps = (child.props as { ref?: React.Ref<unknown> }).ref
  return fromProps ?? (child as unknown as { ref?: React.Ref<unknown> }).ref
}
