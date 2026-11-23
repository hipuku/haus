import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { findUndocumented } from './check-docs-coverage.mjs'

function repo(items, pages) {
  const root = mkdtempSync(join(tmpdir(), 'docs-coverage-'))
  writeFileSync(join(root, 'registry.json'), JSON.stringify({ name: 'x', homepage: 'x', items }))
  const dir = join(root, 'apps/docs/content/docs/components')
  mkdirSync(dir, { recursive: true })
  for (const page of pages) writeFileSync(join(dir, `${page}.mdx`), '')
  return root
}

describe('findUndocumented', () => {
  it('passes when every component item has a page', () => {
    expect(findUndocumented(repo([{ name: 'badge', type: 'registry:ui' }], ['badge']))).toEqual([])
  })

  it('names a component item with no page', () => {
    const items = [
      { name: 'badge', type: 'registry:ui' },
      { name: 'button', type: 'registry:ui' },
    ]
    expect(findUndocumented(repo(items, ['badge']))).toEqual(['button'])
  })

  it('does not ask for a page for an item that is not a component', () => {
    expect(findUndocumented(repo([{ name: 'types', type: 'registry:lib' }], []))).toEqual([])
  })

  it('holds for this repository', () => {
    expect(findUndocumented(join(import.meta.dirname, '..'))).toEqual([])
  })
})

describe('run as a script', () => {
  it('checks, and fails, from a path with a space in it', async () => {
    const { execFileSync } = await import('node:child_process')
    const { cpSync } = await import('node:fs')
    const root = repo([{ name: 'ghost', type: 'registry:ui' }], [])
    const dir = join(root, 'with space')
    mkdirSync(join(dir, 'scripts'), { recursive: true })
    cpSync(join(root, 'registry.json'), join(dir, 'registry.json'))
    cpSync(join(import.meta.dirname, 'check-docs-coverage.mjs'), join(dir, 'scripts/check-docs-coverage.mjs'))
    let code = 0
    try {
      execFileSync('node', ['scripts/check-docs-coverage.mjs'], { cwd: dir, stdio: 'pipe' })
    } catch (error) {
      code = error.status
    }
    expect(code).toBe(1)
  })
})
