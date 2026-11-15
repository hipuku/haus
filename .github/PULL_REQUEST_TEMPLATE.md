## What this changes, and why

<!-- What was broken or missing. What it now does. What you decided against. "Closes #n" for an issue. -->

## Consumer-visible?

<!-- Delete what does not apply. -->

- [ ] Breaking. The CHANGELOG entry and the migration note are in this PR
- [ ] Additive. The CHANGELOG entry is in this PR
- [ ] Neither. Internal only, nothing a consumer sees

## Design

<!-- Keep one. -->

- Figma updated: <!-- link to the frame or variable -->
- No visual change
- Figma follows later (add the `figma-later` label)

## Checks

- [ ] `pnpm run typecheck && pnpm run lint && pnpm run lint:css && pnpm run lint:prose && pnpm run lint:md && pnpm run format:check && pnpm -r run test && pnpm run build`
- [ ] Generated files regenerated rather than edited, if any source changed
- [ ] A test that fails without this change. For a fix, run it against the
      version being fixed to prove it catches it
- [ ] Keyboard and screen reader checked, for anything interactive
- [ ] A numbered decision in `DESIGN.md`, if this settles something someone will re-litigate
