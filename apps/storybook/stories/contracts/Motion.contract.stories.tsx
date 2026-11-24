import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input, Menu, MenuItem, Popover, Tabs, Toast, Toggle } from 'haus-components'
import React, { useRef } from 'react'
import { expect } from 'storybook/test'

/**
 * Plan 4.1's gate: the animations a rendered component actually runs match
 * the motion role tokens, in every mode, reduced included. The token test in
 * @hipuku/motion checks the values; this checks that the components read them.
 *
 * Each case renders in three scopes, one per mode, triggers its motion, and
 * reads `getAnimations()` on the element that moves:
 *
 * · the running duration equals the role's duration token in that scope
 *   (a token the component did not read would not match),
 * · any delay stays inside the scope's stagger maximum,
 * · in reduced, nothing runs longer than the reduced ceiling and nothing moves
 *   (the element's transform at the first frame is the identity),
 * · in subtle and expressive, an entrance that travels does move.
 *
 * Hidden from the sidebar; it runs with every story test.
 */
const meta = {
  title: 'Contracts/Motion',
  tags: ['!dev', '!autodocs'],
  parameters: { a11y: { test: 'off' } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const MODES = ['subtle', 'expressive', 'reduced'] as const
type Mode = (typeof MODES)[number]
const REDUCED_MAX_MS = 120

const ms = (value: string) => {
  const v = value.trim()
  if (v.endsWith('ms')) return parseFloat(v)
  if (v.endsWith('s')) return parseFloat(v) * 1000
  return parseFloat(v)
}
const token = (scope: Element, name: string) => getComputedStyle(scope).getPropertyValue(name)
const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

/** The animations on `el` that this case is about. */
function find(el: Element, match: { animation?: string; transition?: string }) {
  return el.getAnimations().filter(a => {
    // CSS Modules rename keyframes too (haus-Toast-haus-toast-in-abc12), so match the name inside.
    if (match.animation) return (a as CSSAnimation).animationName.includes(match.animation)
    if (match.transition) return (a as CSSTransition).transitionProperty === match.transition
    return false
  })
}

/** Whether `el` is displaced at its animation's first frame. */
function movesAtStart(el: Element, animations: Animation[]) {
  for (const a of animations) {
    a.pause()
    a.currentTime = 0
  }
  const t = getComputedStyle(el).transform
  return t !== 'none' && !new DOMMatrix(t).isIdentity
}

interface Case {
  name: string
  /** The element that moves, inside one mode's scope. */
  target: (scope: Element) => Element | null
  role: string
  match: { animation?: string; transition?: string }
  /** It travels (offset or scale), so subtle and expressive must move it. */
  travels?: boolean
  /** Runs before reading: the state change that starts a transition. */
  trigger?: (scope: Element) => void | Promise<void>
}

async function check(root: HTMLElement, c: Case) {
  for (const mode of MODES) {
    const scope = root.querySelector(`[data-contract="${c.name}"] [data-haus-motion="${mode}"]`)!
    if (c.trigger) {
      await c.trigger(scope)
      await frame()
    }
    const el = c.target(scope) as HTMLElement | null
    await expect(el, `${c.name} ${mode}: no element`).not.toBeNull()
    if (c.match.animation) {
      // An entrance has usually finished by the time play runs, and a finished
      // animation leaves getAnimations(). Restart it from the stylesheet.
      el!.style.animation = 'none'
      void el!.offsetWidth
      el!.style.removeProperty('animation')
      await frame()
    }
    const duration = ms(token(scope, `--haus-motion-${c.role}-duration`))
    const animations = find(el!, c.match)
    const where = `${c.name} (${c.role}) in ${mode}`

    if (duration === 0) {
      // A 0ms role runs nothing, or runs something of no length.
      for (const a of animations) await expect(ms(String(a.effect!.getComputedTiming().duration)), where).toBe(0)
      continue
    }

    await expect(animations.length, `${where}: nothing ran`).toBeGreaterThan(0)
    const staggerMax = ms(token(scope, '--haus-motion-stagger-max'))
    for (const a of animations) {
      const timing = a.effect!.getComputedTiming()
      await expect(Number(timing.duration), `${where}: duration`).toBeCloseTo(duration, 0)
      await expect(Number(a.effect!.getTiming().delay ?? 0), `${where}: delay`).toBeLessThanOrEqual(staggerMax)
    }
    if (mode === 'reduced') {
      await expect(duration, `${where}: over the reduced ceiling`).toBeLessThanOrEqual(REDUCED_MAX_MS)
      await expect(movesAtStart(el!, animations), `${where}: moves in reduced`).toBe(false)
    } else if (c.travels) {
      await expect(movesAtStart(el!, animations), `${where}: does not travel`).toBe(true)
    }
  }
}

function Scopes({ name, children }: { name: string; children: (mode: Mode) => React.ReactNode }) {
  return (
    <div data-contract={name} style={{ display: 'flex', gap: 'var(--haus-space-8)', minBlockSize: '12rem' }}>
      {MODES.map(mode => (
        <div key={mode} data-haus-motion={mode} style={{ position: 'relative', flex: 1 }}>
          {children(mode)}
        </div>
      ))}
    </div>
  )
}

function OpenPopover() {
  const ref = useRef<HTMLButtonElement>(null)
  return (
    <div style={{ position: 'relative' }}>
      <button ref={ref}>Trigger</button>
      <Popover open onClose={() => {}} triggerRef={ref} aria-label="Panel">
        Body
      </Popover>
    </div>
  )
}

function OpenMenu() {
  const ref = useRef<HTMLButtonElement>(null)
  return (
    <div style={{ position: 'relative' }}>
      <button ref={ref}>Trigger</button>
      <Menu open onClose={() => {}} triggerRef={ref} aria-label="Actions">
        <MenuItem>One</MenuItem>
        <MenuItem>Two</MenuItem>
        <MenuItem>Three</MenuItem>
        <MenuItem>Four</MenuItem>
        <MenuItem>Five</MenuItem>
        <MenuItem>Six</MenuItem>
      </Menu>
    </div>
  )
}

function TabsCase() {
  const [value, setValue] = React.useState('a')
  return (
    <Tabs
      aria-label="Sections"
      items={[
        { value: 'a', label: 'First' },
        { value: 'b', label: 'Second' },
      ]}
      value={value}
      onValueChange={setValue}
    />
  )
}

const clickIn = (selector: string) => (scope: Element) => (scope.querySelector(selector) as HTMLElement).click()

const CASES: Case[] = [
  {
    name: 'toast',
    target: s => s.querySelector('[role="status"]'),
    role: 'toast-enter',
    match: { animation: 'haus-toast-in' },
    travels: true,
  },
  {
    name: 'popover',
    target: s => s.querySelector('[role="dialog"]'),
    role: 'popover-enter',
    match: { animation: 'haus-popover-in' },
    travels: true,
  },
  {
    name: 'menu items',
    target: s => s.querySelectorAll('[role="menuitem"]')[5] ?? null,
    role: 'popover-enter',
    match: { animation: 'haus-menu-item-in' },
  },
  {
    name: 'input error',
    target: s => s.querySelector('[role="alert"]')?.parentElement ?? null,
    role: 'layout',
    match: { animation: 'haus-input-error-in' },
  },
  {
    name: 'toggle thumb',
    target: s => s.querySelector('[class*="thumb"]'),
    role: 'layout',
    match: { transition: 'transform' },
    trigger: clickIn('input'),
  },
  {
    name: 'tabs marker',
    target: s => s.querySelector('[role="tablist"] > span[aria-hidden="true"]'),
    role: 'indicator',
    match: { transition: 'transform' },
    trigger: s => (s.querySelectorAll('[role="tab"]')[1] as HTMLElement).click(),
  },
]

export const RolesInEveryMode: Story = {
  name: 'Components run their motion roles in every mode',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--haus-space-8)' }}>
      <Scopes name="toast">{() => <Toast tone="success" title="Saved" />}</Scopes>
      <Scopes name="popover">{() => <OpenPopover />}</Scopes>
      <Scopes name="menu items">{() => <OpenMenu />}</Scopes>
      <Scopes name="input error">{() => <Input label="Email" error="Not valid" />}</Scopes>
      <Scopes name="toggle thumb">{() => <Toggle label="Wifi" />}</Scopes>
      <Scopes name="tabs marker">{() => <TabsCase />}</Scopes>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await frame()
    for (const c of CASES) await check(canvasElement, c)
  },
}
