# @hipuku/config

Shared TypeScript, Prettier and prose configuration, plus the two checks every hipuku repository
runs. One place to change, so a fix reaches every repo through a version bump.

## Why

Counted across eight repositories on 2026-11-23, before this package existed:

| Thing                           | State                                                                   |
| ------------------------------- | ----------------------------------------------------------------------- |
| `scripts/check-punctuation.mjs` | Present in all eight, in **seven distinct versions** (118 to 138 lines) |
| TypeScript `target`             | Four values: ES2017, ES2020, ES2022, es2023                             |
| `strict`                        | Off in kern and in tokenise's app config                                |
| Prettier                        | Two incompatible styles in six repos, and none at all in two            |
| The blocked-name check          | In one repo, which was being deleted                                    |

Most of the seven prose-check variants differed only in quotes and line wrapping, because two
Prettier styles had formatted the same file. Two differences were real: the Next.js repos exclude
generated files, and drift-tests still carried the version that cannot see an untracked file.

## Install

```bash
pnpm add -D @hipuku/config
```

## TypeScript

```jsonc
// tsconfig.json
{
  "extends": "@hipuku/config/tsconfig/base.json",
  "include": ["src"],
}
```

| Preset                | For                                                                 |
| --------------------- | ------------------------------------------------------------------- |
| `tsconfig/base.json`  | The floor: Node 22, ES2022, strict, ESM, `noUncheckedIndexedAccess` |
| `tsconfig/react.json` | A browser app or component package: adds DOM and the JSX runtime    |
| `tsconfig/node.json`  | A service, script or CLI: adds Node types, emits nothing            |

The base is stricter than most of the repos are today. `strict` and `noUncheckedIndexedAccess` will
find real errors in a repo that has not had them. Per WORKFLOW-STANDARD section 9, a rule arrives
with every violation it finds fixed in the same pull request, so adopt one repo at a time and never
as a warning to clear later.

## Prettier

```jsonc
// package.json
{ "prettier": "@hipuku/config/prettier" }
```

| Preset          | Style                                                                             | Repos on it today              |
| --------------- | --------------------------------------------------------------------------------- | ------------------------------ |
| `prettier`      | 100 columns, Prettier's defaults otherwise                                        | drift, core, kern, drift-tests |
| `prettier/wide` | 120 columns, no semicolons, single quotes, trailing commas, bare arrow parameters | haus, vault                    |

Both exist because switching a repo from one to the other reformats every file it has, which buries
the next real diff under a thousand lines of punctuation. A repo takes the preset that matches what
it already does. Converging on one is a separate decision with its own pull request.

## The prose check

Fails on an em dash, in both the forms it takes: the literal character U+2014, and the HTML entity
that renders as one. This file names neither directly, for the same reason the script escapes them:
a document about the rule should not be the one exception to it.

```bash
hipuku-check-prose            # check
hipuku-check-prose --write    # record the current state as the baseline
```

Ratcheted when a baseline file exists, which is the default: a count can only go down, so adding one
fails and removing one fails until the baseline comes down with it. A ceiling alone lets the number
rot. Absolute when there is no baseline, which is right for a repo that started clean.

| Flag                  | Effect                                                              |
| --------------------- | ------------------------------------------------------------------- |
| `--write`             | Write the current counts as the baseline                            |
| `--baseline <path>`   | A baseline somewhere other than `scripts/punctuation-baseline.json` |
| `--absolute`          | Ignore any baseline and fail on every occurrence                    |
| `--generated <regex>` | Exclude files a tool regenerates. Repeatable                        |

A generated-file exclusion belongs in the repo, because it is a property of the repo:

```jsonc
// package.json
{ "hipuku": { "prose": { "generated": ["^AGENTS\\.md$", "^CLAUDE\\.md$"] } } }
```

core and maple need that one. `next dev` rewrites those files on every startup with em dashes baked
in by `node_modules/next/dist/server/lib/generate-agent-files.js`, and there is no opt-out short of
patching that vendored file, so linting them only fails CI on bytes no human here authored.

## The names check

Fails when a blocked personal or employer name appears anywhere in the repository, its history, a
commit message, or the git author and committer identity.

```bash
hipuku-check-names                  # files on disk and the whole history
hipuku-check-names --staged         # staged files, plus identity
hipuku-check-names --message FILE   # a commit message, plus identity
```

The blocked words are stored as SHA-256 hashes, so the list does not publish the names it protects.
A match prints the file and line and never the word.

Wire it into a pre-commit hook with `--staged` and a `commit-msg` hook with `--message`, so a name
cannot reach a commit rather than being found in one.

## What is not here

**ESLint.** The flat configs differ by runtime, not by preference: Electron's renderer rules, Next's
plugin, kern's tier boundaries, drift's service and client split. A shared base is worth doing and
it is a bigger job than this package, so it is its own pull request.

**Stylelint and markdownlint.** Three repos have a `.stylelintrc`, five have a markdownlint config,
and they are close enough to share. Also a later pull request.
