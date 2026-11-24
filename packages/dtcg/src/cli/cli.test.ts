import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { run, USAGE } from './cli.js'

const MODES = join(import.meta.dirname, '..', 'fixtures', 'modes.dtcg.json')

/* One root for the whole suite, removed afterwards, so repeated local runs do
   not leave a temporary directory behind for every case in the file. */
const ROOT = mkdtempSync(join(tmpdir(), 'dtcg-cli-'))
let made = 0

function dir() {
  const path = join(ROOT, String(made++))
  mkdirSync(path, { recursive: true })
  return path
}

afterAll(() => rmSync(ROOT, { recursive: true, force: true }))

function file(name: string, text: string) {
  const path = join(dir(), name)
  writeFileSync(path, text)
  return path
}

const TOKENS = file(
  'tokens.json',
  JSON.stringify({
    color: { brand: { $type: 'color', $value: { colorSpace: 'srgb', components: [1, 0, 0] } } },
    space: { sm: { $type: 'dimension', $value: { value: 4, unit: 'px' } } },
  }),
)

const REM = file('tokens.json', JSON.stringify({ s: { $type: 'dimension', $value: { value: 1, unit: 'rem' } } }))

async function cli(...argv: string[]) {
  let stdout = ''
  let stderr = ''
  const code = await run(argv, { stdout: t => (stdout += t), stderr: t => (stderr += t) })
  return { code, stdout, stderr }
}

describe('dtcg', () => {
  it('writes a single output file to stdout and the loss report to stderr', async () => {
    const { code, stdout, stderr } = await cli(TOKENS, '--to', 'tailwind')
    expect(code).toBe(0)
    expect(stdout).toContain('@theme {')
    expect(stdout).toContain('--spacing-sm: 4px;')
    expect(stdout).not.toContain('loss')
    expect(stderr).toMatch(/^DTCG 2025\.10 to Tailwind v4: \d+ loss/)
  })

  it('names each loss with its token, mode, reason and detail', async () => {
    const { stderr } = await cli(REM, '--to', 'figma', '--out', dir())
    expect(stderr).toContain('DTCG 2025.10 to Figma variables: 1 loss\n')
    expect(stderr).toContain('  s (default): converted-unit. 1rem written as 16px at 16px per rem; Figma has no rem.\n')
  })

  it('writes every file into --out', async () => {
    const out = join(dir(), 'nested')
    const { code, stderr } = await cli(MODES, '--to', 'figma', '--out', out)
    expect(code).toBe(0)
    const written = readdirSync(out).sort()
    expect(written.length).toBeGreaterThan(1)
    for (const name of written) expect(stderr).toContain(`wrote ${join(out, name)}`)
    expect(JSON.parse(readFileSync(join(out, written[0]), 'utf8'))).toBeTypeOf('object')
  })

  it('refuses to print several files to stdout', async () => {
    const { code, stdout, stderr } = await cli(MODES, '--to', 'figma')
    expect(code).toBe(2)
    expect(stdout).toBe('')
    expect(stderr).toMatch(/is \d+ files\. Pass --out <dir>\./)
  })

  it('reads the format named by --from instead of detecting it', async () => {
    // Nothing in this file says Tailwind on its own: no @theme, no :root, and
    // the declaration is indented, so detection refuses it and only --from
    // gets it read. The earlier fixture was detectable either way, so it did
    // not show that --from had done anything.
    const css = file('theme.css', 'html { --color-brand: #ff0000; }\n')
    const detected = await cli(css, '--to', 'dtcg')
    expect(detected.code).toBe(1)
    const { code, stderr } = await cli(css, '--from', 'tailwind', '--to', 'dtcg')
    expect(code).toBe(0)
    expect(stderr).toMatch(/^Tailwind v4 to DTCG 2025\.10/)
  })

  it('applies --rem-base', async () => {
    const px = async (...extra: string[]) => {
      const out = dir()
      await cli(REM, '--to', 'figma', '--out', out, ...extra)
      return JSON.parse(readFileSync(join(out, 'tokens.json'), 'utf8')).s.$value
    }
    expect(await px()).toEqual({ value: 16, unit: 'px' })
    expect(await px('--rem-base', '10')).toEqual({ value: 10, unit: 'px' })
  })

  it('exits 1 with the reason when the input cannot be read', async () => {
    const { code, stderr } = await cli(file('bad.json', '{ not json'), '--to', 'dtcg')
    expect(code).toBe(1)
    expect(stderr).toContain('bad.json is not valid JSON')
  })

  it('exits 1 when a file does not exist', async () => {
    const { code, stderr } = await cli(join(dir(), 'missing.json'), '--to', 'dtcg')
    expect(code).toBe(1)
    expect(stderr).toContain('ENOENT')
  })

  it.each([
    [[], 'Name at least one file to read.'],
    [['x.json'], '--to is required.'],
    [['x.json', '--to', 'scss'], '--to must be one of dtcg, figma, tokens-studio, tailwind.'],
    [['x.json', '--to', 'dtcg', '--from', 'scss'], '--from must be one of'],
    [['x.json', '--to', 'dtcg', '--rem-base', '0'], '--rem-base must be a positive number.'],
    [['x.json', '--to', 'tailwind', '--mode-selector', 'id'], '--mode-selector must be one of'],
    [['x.json', '--to', 'dtcg', '--nope'], "Unknown option '--nope'"],
  ])('exits 2 with the usage for %j', async (argv, message) => {
    const { code, stderr } = await cli(...argv)
    expect(code).toBe(2)
    expect(stderr).toContain(message)
    expect(stderr).toContain(USAGE)
  })

  it('prints the usage to stdout for --help', async () => {
    const { code, stdout } = await cli('--help')
    expect(code).toBe(0)
    expect(stdout).toBe(USAGE)
  })
})

describe('dtcg output safety', () => {
  it('refuses a mode name that would write outside --out, and writes nothing', async () => {
    const source = JSON.parse(readFileSync(MODES, 'utf8'))
    const contexts = source.modifiers.theme.contexts
    contexts['../escaped'] = contexts.dark
    delete contexts.dark
    const input = file('evil.resolver.json', JSON.stringify(source))
    const parent = dir()
    const out = join(parent, 'inner')
    const { code, stderr } = await cli(input, '--to', 'figma', '--out', out)
    expect(code).toBe(1)
    expect(stderr).toContain('"../escaped.tokens.json" is not a plain file name')
    expect(readdirSync(parent)).toEqual([])
  })

  it('exits 3 and names what was written when the output cannot be written', async () => {
    const out = dir()
    mkdirSync(join(out, 'tokens.json'))
    const { code, stderr } = await cli(REM, '--to', 'figma', '--out', out)
    expect(code).toBe(3)
    expect(stderr).toContain('Nothing was written.')
  })
})

describe('dtcg output safety, the remaining paths', () => {
  it('says which files were written before a later one failed', async () => {
    const out = dir()
    mkdirSync(join(out, 'dark.tokens.json'))
    const { code, stderr } = await cli(MODES, '--to', 'figma', '--out', out)
    expect(code).toBe(3)
    expect(stderr).toMatch(/Already written: .*light\.tokens\.json/)
  })

  it('names every unsafe output when there is more than one', async () => {
    const source = JSON.parse(readFileSync(MODES, 'utf8'))
    const contexts = source.modifiers.theme.contexts
    contexts['../a'] = contexts.dark
    contexts['b/c'] = contexts.dark
    delete contexts.dark
    const input = file('evil.resolver.json', JSON.stringify(source))
    const { code, stderr } = await cli(input, '--to', 'figma', '--out', dir())
    expect(code).toBe(1)
    expect(stderr).toContain('are not plain file names')
  })
})
