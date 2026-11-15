/* One vocabulary for both sides. Code and Figma describe the same token or
   component in different units and shapes; everything is reduced here to a flat
   map of item keys to strings, so the diff is plain string equality.

   Item keys:
     token --haus-space-4     the token's resolved value
     component Button         present
     axis Button.size         the axis's values, sorted, joined by |
     states Button            the compared states it draws, sorted, joined by |

   Tokens are compared resolved, not as written. Figma folds the brand layer into
   the semantics collection's modes, so a role there aliases a primitive directly
   while in code it reads a `--haus-brand-*` entry first. Both sides are followed
   to the end of their chain and the final values compared. */

import chroma from 'chroma-js'
import { COMPARED_STATES, isPrivateComponent } from './config.mjs'

const ROOT_PX = 16

export const joinSet = values => [...new Set(values)].sort().join('|')

const round = n => String(Math.round(n * 1000) / 1000)

/** A resolved CSS value or a Figma value, reduced to what both can express. */
export function normaliseValue(raw) {
  if (raw == null) return undefined
  if (typeof raw === 'number') return round(raw)
  if (typeof raw === 'object' && 'hex' in raw) return raw.hex.toLowerCase()
  const v = String(raw).trim()
  const len = v.match(/^(-?[\d.]+)(px|rem)$/)
  if (len) return round(Number(len[1]) * (len[2] === 'rem' ? ROOT_PX : 1))
  if (/^-?[\d.]+$/.test(v)) return round(Number(v))
  // Relative colour syntax, `oklch(from <colour> l c h / 0.6)`: the colour at
  // that alpha, which is how the token layer writes a translucent role.
  const relative = v.match(/^oklch\(from (.+) l c h \/ ([\d.]+)\)$/)
  if (relative && chroma.valid(relative[1])) return chroma(relative[1]).alpha(Number(relative[2])).hex().toLowerCase()
  if (chroma.valid(v)) return chroma(v).hex().toLowerCase()
  // A font stack: Figma holds one family, so compare the first. A comma inside
  // brackets belongs to a function (`cubic-bezier(0.2, 0, 0, 1)`), kept whole.
  const unquote = s => s.trim().replace(/^['"]|['"]$/g, '')
  return v.includes(',') && !v.includes('(') ? unquote(v.split(',')[0]) : unquote(v)
}

/** The CSS custom property a Figma variable stands for. */
export function variableToProperty(v) {
  const syntax = v.codeSyntax?.WEB?.match(/var\((--[\w-]+)\)/)
  return syntax ? syntax[1] : `--${v.name.replace(/\//g, '-')}`
}

/** Items from the exported Figma file. */
export function figmaItems({ variables = [], components = [] }) {
  const items = {}
  for (const v of variables) {
    // Figma's opacity fields take a percentage, so its opacity variables hold
    // 40 where the CSS holds 0.4.
    const value = v.name.startsWith('opacity/') && typeof v.value === 'number' ? v.value / 100 : v.value
    items[`token ${variableToProperty(v)}`] = normaliseValue(value)
  }
  for (const c of components) {
    if (c.inSet || isPrivateComponent(c.name)) continue
    items[`component ${c.name}`] = 'present'
    for (const p of c.props) {
      if (p.type !== 'VARIANT') continue
      const name = p.name.split('#')[0].toLowerCase()
      if (name === 'state') {
        const states = p.options.map(o => o.toLowerCase()).filter(o => COMPARED_STATES.has(o))
        if (states.length) items[`states ${c.name}`] = joinSet(states)
        continue
      }
      // A variant axis of false|true is a boolean, which is a layer toggle as
      // often as a prop; booleans are not compared on either side.
      if (joinSet(p.options.map(o => o.toLowerCase())) === 'false|true') continue
      items[`axis ${c.name}.${name}`] = joinSet(p.options.map(o => o.toLowerCase()))
    }
  }
  return items
}
