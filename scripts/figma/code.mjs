/* The code side of the parity check: haus's tokens and its components, reduced
   to the same item keys as the Figma side (see normalise.mjs). */

import fs from 'fs'
import path from 'path'
import { CSS_STATES, PATHS, SKIP_PROPS } from './config.mjs'
import { joinSet, normaliseValue } from './normalise.mjs'

const stripComments = css => css.replace(/\/\*[\s\S]*?\*\//g, '')

/** Every `--haus-*` declaration in the default token stack, as written. The
    first declaration wins, which is the `:root` one. A named brand in brands/
    is a Figma mode, not the default, so its `--haus-brand-*` entries are not
    read; the primitive ramps it declares (vault's ruby, core's paper and
    cobalt) are, because Figma holds those in haus/primitives beside haus's. */
export function rawTokens(root = '.') {
  const raw = {}
  const read = (file, keep = () => true) => {
    const css = stripComments(fs.readFileSync(file, 'utf8'))
    for (const m of css.matchAll(/(--haus-[\w-]+)\s*:\s*([^;]+);/g)) if (keep(m[1])) raw[m[1]] ??= m[2].trim()
  }
  for (const file of PATHS.tokenFiles) read(path.join(root, PATHS.tokens, file))
  const brands = path.join(root, PATHS.brands)
  for (const file of fs
    .readdirSync(brands)
    .filter(f => f.endsWith('.css'))
    .sort()) {
    read(path.join(brands, file), name => !name.startsWith('--haus-brand-'))
  }
  return raw
}

/** A value with every `var()` followed to the end of its chain. */
export function resolve(value, raw, depth = 0) {
  if (depth > 12) return value
  return value.replace(/var\((--[\w-]+)(?:\s*,\s*([^)]+))?\)/g, (whole, name, fallback) => {
    if (raw[name] !== undefined) return resolve(raw[name], raw, depth + 1)
    return fallback !== undefined ? resolve(fallback.trim(), raw, depth + 1) : whole
  })
}

const px = v => {
  const m = String(v).match(/^(-?[\d.]+)(px|rem)?$/)
  return m ? Number(m[1]) * (m[2] === 'rem' ? 16 : 1) : undefined
}

/** haus's tokens, resolved. `--haus-brand-*` entries are left out: Figma holds
    a brand as a mode of the semantics collection, so it has no variable of its
    own. A type role's leading and tracking are compared in pixels at the role's
    size, because that is what the Figma variable holds (decision 0026); the
    ratio itself has no unit for a Figma number to carry. */
export function codeTokens(root = '.') {
  const raw = rawTokens(root)
  const items = {}
  for (const name of Object.keys(raw)) {
    if (name.startsWith('--haus-brand-')) continue
    let value = resolve(raw[name], raw)
    const role = name.match(/^--haus-type-(.+)-(leading|tracking)$/)
    if (role) {
      const size = px(resolve(raw[`--haus-type-${role[1]}-size`] ?? '', raw))
      const ratio = value === 'normal' ? 0 : parseFloat(value)
      if (size !== undefined && Number.isFinite(ratio)) value = size * ratio
    }
    items[`token ${name}`] = normaliseValue(value)
  }
  return items
}

/** String-union type aliases, followed through other aliases: `BadgeTone =
    Tone | 'primary'` resolves to Tone's five values and `primary`. */
export function unionAliases(...sources) {
  const decl = {}
  for (const src of sources)
    for (const m of src.matchAll(/^(?:export )?type (\w+)\s*=\s*([^\n{]+)$/gm)) decl[m[1]] ??= m[2].trim()
  const resolved = {}
  const values = (name, seen = new Set()) => {
    if (resolved[name]) return resolved[name]
    if (!decl[name] || seen.has(name)) return undefined
    seen.add(name)
    // Extract<Size, 'sm' | 'md'> keeps the listed members; Exclude drops them.
    const narrowed = decl[name].match(/^(Extract|Exclude)<\s*(\w+)\s*,\s*(.+)>$/)
    if (narrowed) {
      const base = values(narrowed[2], seen)
      const listed = [...narrowed[3].matchAll(/'([^']*)'/g)].map(m => m[1])
      if (!base) return undefined
      return (resolved[name] = base.filter(v => listed.includes(v) === (narrowed[1] === 'Extract')))
    }
    const out = []
    for (const part of decl[name].split('|').map(p => p.trim())) {
      const lit = part.match(/^'([^']*)'$/)
      if (lit) out.push(lit[1])
      else if (/^\w+$/.test(part) && values(part, seen)) out.push(...values(part, seen))
      else return undefined
    }
    return (resolved[name] = out)
  }
  for (const name of Object.keys(decl)) values(name)
  return resolved
}

/** The props a component file declares typed as a string union, inline or
    through an alias, across every props type in the file (a union's halves
    included). */
export function variantProps(src, aliases) {
  const props = {}
  const body = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  for (const m of body.matchAll(/^\s+(\w+)\??\s*:\s*([^;\n]+?)\s*;?\s*$/gm)) {
    const [, prop, type] = m
    if (SKIP_PROPS.has(prop) || /^aria|ClassName$/.test(prop) || props[prop]) continue
    let values
    if (/^'[^']*'(\s*\|\s*'[^']*')*$/.test(type)) values = type.split('|').map(v => v.trim().replace(/'/g, ''))
    else if (/^\w+$/.test(type)) values = aliases[type]
    if (values?.length > 1) props[prop] = values
  }
  return props
}

/** The compared states a stylesheet styles. `:not(:disabled)` excludes rather
    than styles, so negations are dropped first: `.trigger:hover:not(:disabled)`
    styles hover only. */
export function statesOf(css) {
  const bare = stripComments(css).replace(/:not\([^()]*(?:\([^()]*\)[^()]*)*\)/g, '')
  const found = new Set()
  for (const m of bare.matchAll(/:(hover|active|focus-visible|disabled)\b/g)) found.add(CSS_STATES[m[1]])
  if (/\[disabled\]|\[aria-disabled=['"]?true['"]?\]|\.disabled\b/.test(bare)) found.add('disabled')
  return [...found]
}

/** Every component folder, with its variant axes and the states it styles. */
export function codeComponents(root = '.') {
  const items = {}
  const types = fs.readFileSync(path.join(root, PATHS.types), 'utf8')
  const dir = path.join(root, PATHS.components)
  for (const name of fs.readdirSync(dir).sort()) {
    const tsx = path.join(dir, name, `${name}.tsx`)
    if (!fs.existsSync(tsx)) continue
    items[`component ${name}`] = 'present'
    const src = fs.readFileSync(tsx, 'utf8')
    const aliases = unionAliases(src, types)
    for (const [prop, values] of Object.entries(variantProps(src, aliases))) {
      items[`axis ${name}.${prop.toLowerCase()}`] = joinSet(values.map(v => v.toLowerCase()))
    }
    const cssPath = path.join(dir, name, `${name}.module.css`)
    const states = fs.existsSync(cssPath) ? statesOf(fs.readFileSync(cssPath, 'utf8')) : []
    if (states.length) items[`states ${name}`] = joinSet(states)
  }
  return items
}

export const codeItems = (root = '.') => ({ ...codeTokens(root), ...codeComponents(root) })
