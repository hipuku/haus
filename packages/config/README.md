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

| Flag                 | Effect                                                                                |
| -------------------- | ------------------------------------------------------------------------------------- |
| `--write`            | Write the current counts as the baseline                                              |
| `--baseline <path>`  | A baseline somewhere other than `scripts/punctuation-baseline.json`                   |
| `--absolute`         | Ignore any baseline and fail on every occurrence                                      |
| `--generated <path>` | Exclude a file a tool regenerates, or a directory when it ends in a slash. Repeatable |

A generated-file exclusion belongs in the repo, because it is a property of the repo:

```jsonc
// package.json
{ "hipuku": { "prose": { "generated": ["AGENTS.md", "CLAUDE.md"] } } }
```

Each value is a plain repo-relative path, or a directory when it ends in a slash, not a pattern.
The first version of these options built a regular expression from the value, which CodeQL flagged
as a regex injection on 2026-11-23. Both real uses were literal paths, so a pattern was never
needed, and a path is easier to write correctly.

core and maple need that one. `next dev` rewrites those files on every startup with em dashes baked
in by `node_modules/next/dist/server/lib/generate-agent-files.js`, and there is no opt-out short of
patching that vendored file, so linting them only fails CI on bytes no human here authored.

## The names check

Fails when a blocked personal or employer name appears in a file on disk, in a commit message, or in
a git author or committer identity.

```bash
hipuku-check-names                  # files on disk, and every commit message and identity
hipuku-check-names --staged         # staged files, plus identity
hipuku-check-names --message FILE   # a commit message, plus identity
```

What it does not read is historical file contents. The history pass is `git log --all` over commit
messages and the author and committer of each commit, so a name that was only ever in a version of a
file that has since been changed or deleted goes unreported. Treat this as a gate on what is being
written, not as an audit of what has already been pushed.

The blocked words are stored as SHA-256 hashes, so the list does not publish the names it protects.
A match prints the file and line and never the word.

That also means a test cannot write a blocked word in order to check that it is caught, so the
script reads `HIPUKU_NAMES_TEST_HASHES` for a comma-separated list of extra hashes. It exists for
the test suite, which puts a harmless sentinel word there, and it is not configuration: a repo that
needs to block a further name should get a `package.json` key and a decision record instead.

Takes the same kind of exclusion, for data files whose words are nobody's prose:

```jsonc
// package.json
{ "hipuku": { "names": { "skip": ["packages/colour/src/names/colournames.json"] } } }
```

haus needs that one. A 31,900-entry colour-name database contains most of the English language, so
a collision with a blocked word is certain and means nothing.

Wire it into a pre-commit hook with `--staged` and a `commit-msg` hook with `--message`, so a name
cannot reach a commit rather than being found in one.

## What is not here

**ESLint.** The flat configs differ by runtime, not by preference: Electron's renderer rules, Next's
plugin, kern's tier boundaries, drift's service and client split. A shared base is worth doing and
it is a bigger job than this package, so it is its own pull request.

**Stylelint and markdownlint.** Three repos have a `.stylelintrc`, five have a markdownlint config,
and they are close enough to share. Also a later pull request.
