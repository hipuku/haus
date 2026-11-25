'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
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
  const beat = useBeat(240, 600)
  const cycle = EMAIL.length + 14
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
  const beat = useBeat(2800, 1400)
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

/*
 * A team list that pages: the three people fade out and the next three come
 * in, on the fade role, so the list is never empty for more than the length
 * of one fade.
 */
const TEAMS = [
  [
    { name: 'Ada Lovelace', role: 'Owner', status: 'online' as const, tone: 'info' as const },
    { name: 'Grace Hopper', role: 'Admin', status: 'away' as const, tone: 'success' as const },
    { name: 'Alan Turing', role: 'Member', status: 'busy' as const, tone: 'neutral' as const },
  ],
  [
    { name: 'Katherine Johnson', role: 'Admin', status: 'online' as const, tone: 'success' as const },
    { name: 'Edsger Dijkstra', role: 'Member', status: 'offline' as const, tone: 'neutral' as const },
    { name: 'Margaret Hamilton', role: 'Owner', status: 'online' as const, tone: 'info' as const },
  ],
]
function Team() {
  const beat = useBeat(4600, 2600)
  const team = TEAMS[beat % TEAMS.length]
  return (
    <Tile uses={['Avatar', 'Badge']}>
      <ul className={`${styles.list} ${styles.page}`} key={beat % TEAMS.length}>
        {team.map(person => (
          <li className={styles.person} key={person.name}>
            <Avatar name={person.name} size="sm" status={person.status} />
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
  const beat = useBeat(4400, 800)
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
  const beat = useBeat(3400, 2000)
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
  const beat = useBeat(4800, 3200)
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
  const beat = useBeat(3200, 1200)
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
  const beat = useBeat(3400, 1800)
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

/*
 * An export form whose first field is used as a person would use it: the
 * Select opens, the highlight steps to the next option, the option is chosen
 * and the panel closes. The screen is inert, so the loop drives the real
 * Select through its own handlers, a click on the trigger, a pointer entering
 * a row, a click on it, rather than a prop that opens it, which it does not
 * have. The fields below are what the open panel lies over.
 */
const FORMATS = [
  { label: 'CSS custom properties', value: 'css' },
  { label: 'DTCG JSON', value: 'dtcg' },
  { label: 'TypeScript', value: 'ts' },
]
function Export() {
  const [format, setFormat] = useState('css')
  const ref = useRef<HTMLDivElement>(null)
  // The step reads the current choice without making it a reason to rerun.
  const current = useRef(format)
  current.current = format
  const beat = useBeat(1400, 3000)

  useEffect(() => {
    const root = ref.current
    if (!root || beat === 0) return
    const trigger = root.querySelector<HTMLElement>('[role="combobox"]')
    const step = beat % 4
    if (step === 1) trigger?.click()
    const options = [...root.querySelectorAll<HTMLElement>('[role="option"]')]
    const next = options[(FORMATS.findIndex(f => f.value === current.current) + 1) % FORMATS.length]
    if (step === 2) next?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: root }))
    if (step === 3) next?.click()
  }, [beat])

  return (
    <Tile uses={['Select', 'Checkbox', 'Button']}>
      <div className={styles.stack} ref={ref}>
        <Select label="Export as" onChange={setFormat} options={FORMATS} value={format} />
        <Select label="Colour space" onChange={noop} options={[{ label: 'OKLCH', value: 'oklch' }]} value="oklch" />
        <Checkbox checked label="Include the dark mode" onChange={noop} />
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
    // The expressive mode: haus's own slower, softer curves for every role,
    // scoped to the wall, so the screens play at a pace a reader can follow
    // while the rest of the site keeps the standard timings.
    <div className={styles.wall} data-haus-motion="expressive">
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
