'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  Avatar,
  Badge,
  Button,
  Callout,
  Card,
  Checkbox,
  Divider,
  EmptyState,
  IconButton,
  Input,
  RadioGroup,
  Select,
  Spinner,
  Tabs,
  Textarea,
  Toast,
  Toggle,
} from 'haus-components'
import styles from './wall.module.css'

/*
 * The components in use, as a wall of small screens.
 *
 * Each tile is a fragment of an app built from the published components and
 * nothing else: a sign-in form, a settings group, a deploy status. The screens
 * are `inert`, so none of them takes a click, a keystroke or focus: they are a
 * picture of the system working rather than a place to use it. The caption
 * under each names the components in it and links to their pages, and those
 * links are the only interactive thing in the wall.
 *
 * The screens play themselves instead. Each runs a short loop on a timer that
 * changes its components' real props, a toggle's `checked`, a radio group's
 * `value`, a tab's `value`, so what moves is each component's own transition
 * and not an imitation of it. The loops are offset so the wall does not pulse
 * in step. Under `prefers-reduced-motion` or `data-haus-motion="reduced"` no
 * loop runs and each screen holds its first state.
 *
 * The columns drift, in alternate directions, so the page shows more than
 * fits in it. The drift is ambient rather than a transition, so no motion
 * role's cap applies to it. It is linear and slow, and it does not stop on
 * hover, on focus or from a control: the owner's call, 2026-11-25. With motion
 * reduced it does not run, and the wall is a still grid.
 *
 * A column is its tiles twice, so the loop has no seam. The second copy is
 * hidden from assistive technology, so each caption link is announced once.
 *
 * Overlays are not here. A Modal, Drawer, ConfirmDialog, Popover or Menu is
 * opened from something and covers the page, and a tile cannot show that
 * without either opening over the landing page or faking it.
 */

const noop = () => {}

function motionReduced() {
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.closest('[data-haus-motion="reduced"]') !== null
  )
}

/**
 * A counter that advances every `period` ms, starting after `delay`. Stays at
 * 0 with motion reduced, so every screen shows its first state.
 */
function useBeat(period: number, delay = 0) {
  const [beat, setBeat] = useState(0)
  useEffect(() => {
    if (motionReduced()) return
    let interval: ReturnType<typeof setInterval> | undefined
    const start = setTimeout(() => {
      setBeat(b => b + 1)
      interval = setInterval(() => setBeat(b => b + 1), period)
    }, delay)
    return () => {
      clearTimeout(start)
      clearInterval(interval)
    }
  }, [period, delay])
  return beat
}

const Icon = ({ d }: { d: string }) => (
  <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ICONS = {
  bold: 'M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z',
  italic: 'M14 5h-4M14 19h-4M14 5l-4 14',
  link: 'M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1',
  inbox: 'M3 13h5l1 3h6l1-3h5M5 5h14l2 8v6H3v-6z',
}

function Tile({ uses, children }: { uses: string[]; children: ReactNode }) {
  return (
    <figure className={styles.tile}>
      <Card className={styles.screen} inert>
        {children}
      </Card>
      <figcaption className={styles.caption}>
        {uses.map((name, i) => (
          <span key={name}>
            {i > 0 && <span aria-hidden="true"> · </span>}
            <Link href={`/docs/components/${name.replace(/(?<!^)([A-Z])/g, '-$1').toLowerCase()}`}>{name}</Link>
          </span>
        ))}
      </figcaption>
    </figure>
  )
}

/* The address types itself out, holds, and clears; the box ticks as it
   finishes. */
const EMAIL = 'ada@hipuku.dev'
function SignIn() {
  const beat = useBeat(140, 300)
  const cycle = EMAIL.length + 16
  const step = beat % cycle
  const typed = EMAIL.slice(0, Math.min(step, EMAIL.length))
  return (
    <Tile uses={['Input', 'Checkbox', 'Button']}>
      <div className={styles.stack}>
        <Input label="Email" onChange={noop} type="email" value={beat === 0 ? EMAIL : typed} />
        <Input label="Password" onChange={noop} type="password" value="analytical" />
        <Checkbox checked={beat === 0 || step >= EMAIL.length} label="Keep me signed in" onChange={noop} />
        <Button variant="primary">Sign in</Button>
      </div>
    </Tile>
  )
}

/* One switch flips at a time, round the three. */
function Notifications() {
  const beat = useBeat(1600, 900)
  const flipped = beat % 3
  const base = [true, false, true]
  const on = (i: number) => (beat === 0 ? base[i] : base[i] !== (flipped === i && Math.floor(beat / 3) % 2 === 0))
  const rows = [
    { label: 'Mentions', description: 'When someone mentions you' },
    { label: 'Weekly digest', description: 'A summary every Monday' },
    { label: 'Builds', description: 'Deploys and failed checks' },
  ]
  return (
    <Tile uses={['Toggle', 'Divider']}>
      <div className={styles.stack}>
        {rows.map((row, i) => (
          <div className={styles.stack} key={row.label}>
            {i > 0 && <Divider spacing="none" />}
            <Toggle
              checked={on(i)}
              className={styles.spread}
              description={row.description}
              label={row.label}
              onChange={noop}
            />
          </div>
        ))}
      </div>
    </Tile>
  )
}

/* Presence changes, one person at a time. */
function Team() {
  const beat = useBeat(2200, 1500)
  const statuses = ['online', 'away', 'busy', 'offline'] as const
  const people = [
    { name: 'Ada Lovelace', role: 'Owner', tone: 'info' as const },
    { name: 'Grace Hopper', role: 'Admin', tone: 'success' as const },
    { name: 'Alan Turing', role: 'Member', tone: 'neutral' as const },
  ]
  return (
    <Tile uses={['Avatar', 'Badge']}>
      <ul className={styles.list}>
        {people.map((person, i) => (
          <li className={styles.person} key={person.name}>
            <Avatar name={person.name} size="sm" status={statuses[(i + beat) % statuses.length]} />
            <span className={styles.personName}>{person.name}</span>
            <Badge tone={person.tone}>{person.role}</Badge>
          </li>
        ))}
      </ul>
    </Tile>
  )
}

/* A deploy runs, then lands. */
function Deploy() {
  const beat = useBeat(2600, 400)
  const done = beat % 2 === 0
  return (
    <Tile uses={['Callout', 'Button']}>
      <div className={styles.stack}>
        {done ? (
          <Callout key="done" tone="success">
            Deployed to production in 41 seconds.
          </Callout>
        ) : (
          <Callout key="running" tone="info">
            Deploying to production.
          </Callout>
        )}
        <div className={styles.row}>
          <Button variant="secondary">Redeploy</Button>
          <Button variant="ghost">View logs</Button>
        </div>
      </div>
    </Tile>
  )
}

/* The selected tab moves along, and its marker with it. */
function Sections() {
  const beat = useBeat(2000, 1200)
  const items = [
    { label: 'Tokens', value: 'tokens' },
    { label: 'Components', value: 'components' },
    { label: 'Motion', value: 'motion' },
  ]
  const panels: Record<string, string> = {
    tokens: '438 custom properties, light and dark.',
    components: '23 components, installed as source.',
    motion: 'Ten roles, each with a capped duration.',
  }
  const tab = items[beat % items.length].value
  return (
    <Tile uses={['Tabs']}>
      <Tabs aria-label="Package contents" items={items} onValueChange={noop} value={tab}>
        <p className={styles.panelText}>{panels[tab]}</p>
      </Tabs>
    </Tile>
  )
}

/* Notices arrive in turn, each with Toast's own entrance. */
const NOTICES = [
  { title: 'Palette saved', description: '3 colours added to Brand.', tone: 'success' as const },
  { title: 'Import failed', description: 'The file is not valid DTCG.', tone: 'error' as const },
  { title: 'Sync paused', description: 'Figma is not reachable.', tone: 'warning' as const },
]
function Notices() {
  const beat = useBeat(2800, 2000)
  const first = NOTICES[beat % NOTICES.length]
  const second = NOTICES[(beat + 1) % NOTICES.length]
  return (
    <Tile uses={['Toast']}>
      <div className={styles.stack}>
        <Toast description={first.description} key={`a${beat}`} title={first.title} tone={first.tone} />
        <Toast description={second.description} key={`b${beat}`} title={second.title} tone={second.tone} />
      </div>
    </Tile>
  )
}

function Empty() {
  return (
    <Tile uses={['EmptyState', 'Button']}>
      <EmptyState
        action={<Button size="sm">Add a colour</Button>}
        description="Add by hex or extract from an image."
        headingLevel={3}
        icon={<Icon d={ICONS.inbox} />}
        title="No colours yet"
      />
    </Tile>
  )
}

/* The answer moves between the three options. */
function Feedback() {
  const beat = useBeat(1800, 700)
  const options = [
    { label: 'Yes', value: 'yes' },
    { label: 'Partly', value: 'partly' },
    { label: 'No', value: 'no' },
  ]
  return (
    <Tile uses={['RadioGroup', 'Textarea', 'Button']}>
      <div className={styles.stack}>
        <RadioGroup
          label="Did this page help?"
          name="helpful"
          onChange={noop}
          options={options}
          orientation="horizontal"
          value={options[beat % options.length].value}
        />
        <Textarea label="What was missing?" onChange={noop} rows={3} value="An example with a form." />
        <Button variant="secondary">Send</Button>
      </div>
    </Tile>
  )
}

/* The document saves, then reports it saved. */
function Toolbar() {
  const beat = useBeat(1900, 1000)
  const saving = beat % 2 === 1
  return (
    <Tile uses={['IconButton', 'Spinner']}>
      <div className={styles.row}>
        <IconButton icon={<Icon d={ICONS.bold} />} label="Bold" variant="ghost" />
        <IconButton icon={<Icon d={ICONS.italic} />} label="Italic" variant="ghost" />
        <IconButton icon={<Icon d={ICONS.link} />} label="Link" variant="ghost" />
        <span className={styles.saving}>
          {saving && <Spinner size="sm" />}
          {saving ? 'Saving' : 'Saved'}
        </span>
      </div>
    </Tile>
  )
}

/* The chosen format changes. */
function Export() {
  const beat = useBeat(2400, 1800)
  const options = [
    { label: 'CSS custom properties', value: 'css' },
    { label: 'DTCG JSON', value: 'dtcg' },
    { label: 'TypeScript', value: 'ts' },
  ]
  return (
    <Tile uses={['Select', 'Button']}>
      <div className={styles.stack}>
        <Select label="Export as" onChange={noop} options={options} value={options[beat % options.length].value} />
        <Button variant="primary">Export</Button>
      </div>
    </Tile>
  )
}

const COLUMNS = [
  [SignIn, Team, Toolbar],
  [Notifications, Empty, Export],
  [Deploy, Sections, Notices, Feedback],
]

export function Wall() {
  return (
    <div className={styles.wall}>
      <div className={styles.columns}>
        {COLUMNS.map((tiles, i) => (
          <div className={styles.column} key={i}>
            <div className={styles.track}>
              <div className={styles.set}>
                {tiles.map(Scene => (
                  <Scene key={Scene.name} />
                ))}
              </div>
              <div aria-hidden="true" className={`${styles.set} ${styles.copy}`} inert>
                {tiles.map(Scene => (
                  <Scene key={Scene.name} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
