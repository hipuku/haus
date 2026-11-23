# @hipuku/dtcg

Reads design tokens from four formats into one model, writes that model back out to any of them,
and reports what each conversion loses, in code or with the `dtcg` command. It runs the converter
page on the haus docs site.

Formats: DTCG (including resolver documents with modes), Figma variables exports, Tokens Studio,
and Tailwind v4 `@theme` stylesheets.

Not published yet. Version 0.1.0 is unreleased.

## Use

```ts
import { convert } from '@hipuku/dtcg'

const result = convert([{ name: 'tokens.json', text }], 'tailwind')
// result.format: the format detected in the input
// result.files: the written output, one or more files
// result.allLosses: what was lost reading the input, then writing the target,
//   each entry naming the token, the reason and a detail
```

`read` and `write` are the two halves of `convert`, for reading once and writing several formats.
`detectFormat` returns the format of a set of documents from their shape. `read` throws a
`ReadError` when the input cannot be read.

## The dtcg command

The package installs a `dtcg` command.

```bash
npx dtcg tokens.json --to tailwind > theme.css
npx dtcg theme.css --from tailwind --to figma --out figma/
```

With `--out`, every output file is written into that directory, one file included. Without it,
a single output file goes to stdout, and more than one is an error. The loss report goes to
stderr, one line per loss: the token, its mode, the reason and a detail.

| Option                   | Meaning                                                                       |
| ------------------------ | ----------------------------------------------------------------------------- |
| `--to <format>`          | The format to write: `dtcg`, `figma`, `tokens-studio` or `tailwind`. Required |
| `--from <format>`        | The format to read. Detected from the input when left out                     |
| `--out <dir>`            | Write the output files here. Required when the output is more than one file   |
| `--rem-base <px>`        | Pixels per rem. Default 16                                                    |
| `--mode-selector <kind>` | How a Tailwind stylesheet switches modes: `data-theme`, `class` or `media`    |

Exit codes: 0 converted, 1 the input could not be read or names an output file outside `--out`,
2 the command was wrong, 3 the output could not be written.

## Develop

```bash
pnpm --filter @hipuku/dtcg build
pnpm --filter @hipuku/dtcg test
```

The tests read real exports from `src/fixtures`, including copies of two of the app's samples.
