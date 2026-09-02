## What this changes, and why

<!-- What was broken or missing. What it now does. What you decided against. -->

## Consumer-visible?

<!-- Delete what does not apply. -->

- [ ] Breaking. The CHANGELOG entry and the migration note are in this PR
- [ ] Additive. The CHANGELOG entry is in this PR
- [ ] Neither. Internal only, nothing a consumer sees

## Checks

- [ ] `pnpm run typecheck && pnpm run lint && pnpm run lint:css && pnpm -r run test && pnpm run build`
- [ ] Generated files regenerated rather than edited, if any source changed
- [ ] A test that fails without this change. For a fix, run it against the
      version being fixed to prove it catches it
- [ ] A decision record, if this settles something someone will re-litigate
