'use client'

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from 'react'
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
 * The components in use, as a marquee of small screens.
 *
 * Each tile is a fragment of an app built from the published components and
 * nothing else. The screens are `inert`: a picture of the system working
 * rather than a place to use it. The caption under each names the components
 * in it and links to their pages, and those links are the only interactive
 * thing in the wall.
 *
 * What moves, and why only that. A screen changes only a prop the component
 * animates itself, so every movement on the wall is the component's own
 * transition and nothing is shown that the component does not do:
 *
 * - Toggle `checked`: the thumb slides on the layout role
 * - Checkbox `checked`: the box fills and the tick draws
 * - RadioGroup `value`: the dot grows in the newly chosen option
 * - Tabs `value`: the marker slides to the chosen tab
 * - Select: the panel opens, the highlight travels, the choice commits and the
 *   panel closes, driven through the Select's own click and pointer handlers
 *   because it has no prop that opens it
 * - Toast: each notice arrives on its entrance and leaves on its exit, which a
 *   caller runs by setting `data-state="closed"`, as Toast documents
 * - Spinner: spins
 *
 * Avatar, Badge, Callout, Input and Button have no transition for a change of
 * content, so they hold still: swapping their text would be a cut, and a cut
 * presented as motion claims something they do not do. Button's hover and
 * press need a real pointer, so they are not faked.
 *
 * The whole wall runs in haus's expressive motion mode, scoped to it.
 *
 * One clock. Every screen reads one shared tick, so every copy of a screen is
 * in the same state at the same moment and is the same height. That is what
 * lets the marquee loop without a seam: when the track has moved by one set,
 * the set below is pixel for pixel what the first one was.
 *
 * The marquee. Each column measures one set of its tiles and repeats it until
 * the window is always full, then moves by exactly one set's height at a
 * constant speed, so a short column never runs out and the restart lands on
 * an identical frame. Alternate columns run the other way. Under
 * `prefers-reduced-motion`, `data-haus-motion="reduced"` or a phone width, the
 * clock does not run, the columns do not move, and the wall is a still grid of
 * one set each.
 *
 * Overlays are not here. A Modal, Drawer, ConfirmDialog, Popover or Menu
 * covers the page, and a tile cannot show that without opening over the
 * landing page or faking it.
 */

const TICK = 400
const SPEED = 18 // px per second

const noop = () => {}
const Clock = createContext(0)

function motionReduced() {
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.querySelector('[data-haus-motion="reduced"]') !== null
  )
}

/** Which step of a loop of `steps` a screen is on, each step `every` ticks. */
function useStep(steps: number, every: number, offset = 0) {
  const tick = useContext(Clock)
  return Math.floor((tick + offset) / every) % steps
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

/* The box ticks and clears. */
function SignIn() {
  const checked = useStep(2, 8, 3) === 0
  return (
    <Tile uses={['Input', 'Checkbox', 'Button']}>
      <div className={styles.stack}>
        <Input label="Email" onChange={noop} type="email" value="ada@hipuku.dev" />
        <Input label="Password" onChange={noop} type="password" value="analytical" />
        <Checkbox checked={checked} label="Keep me signed in" onChange={noop} />
        <Button variant="primary">Sign in</Button>
      </div>
    </Tile>
  )
}

/* Each switch flips in turn, then each flips back in turn. */
const SETTINGS = [
  { label: 'Mentions', description: 'When someone mentions you', on: true },
  { label: 'Weekly digest', description: 'A summary every Monday', on: false },
  { label: 'Builds', description: 'Deploys and failed checks', on: true },
]
function Notifications() {
  const step = useStep(6, 7, 1)
  // Steps 1 to 3 flip rows 0 to 2; steps 4 to 6 flip them back in the same order.
  const flipped = (i: number) => step > i && step <= i + 3
  return (
    <Tile uses={['Toggle', 'Divider', 'Button']}>
      <div className={styles.stack}>
        {SETTINGS.map((row, i) => (
          <div className={styles.stack} key={row.label}>
            {i > 0 && <Divider spacing="none" />}
            <Toggle
              checked={row.on !== flipped(i)}
              className={styles.spread}
              description={row.description}
              label={row.label}
              onChange={noop}
            />
          </div>
        ))}
        <Button variant="primary">Save preferences</Button>
      </div>
    </Tile>
  )
}

function Team() {
  const people = [
    { name: 'Ada Lovelace', role: 'Owner', status: 'online' as const, tone: 'info' as const },
    { name: 'Grace Hopper', role: 'Admin', status: 'away' as const, tone: 'success' as const },
    { name: 'Alan Turing', role: 'Member', status: 'busy' as const, tone: 'neutral' as const },
  ]
  return (
    <Tile uses={['Avatar', 'Badge', 'Button']}>
      <div className={styles.stack}>
        <ul className={styles.list}>
          {people.map(person => (
            <li className={styles.person} key={person.name}>
              <Avatar name={person.name} size="sm" status={person.status} />
              <span className={styles.personName}>{person.name}</span>
              <Badge tone={person.tone}>{person.role}</Badge>
            </li>
          ))}
        </ul>
        <Button variant="primary">Invite people</Button>
      </div>
    </Tile>
  )
}

function Deploy() {
  return (
    <Tile uses={['Callout', 'Button']}>
      <div className={styles.stack}>
        <Callout tone="success">Deployed to production in 41 seconds.</Callout>
        <div className={styles.row}>
          <Button variant="primary">Redeploy</Button>
          <Button variant="ghost">View logs</Button>
        </div>
      </div>
    </Tile>
  )
}

/* The selected tab moves along, and its marker slides with it. */
const TAB_ITEMS = [
  { label: 'Tokens', value: 'tokens' },
  { label: 'Components', value: 'components' },
  { label: 'Motion', value: 'motion' },
]
const PANELS: Record<string, string> = {
  tokens: '438 custom properties, light and dark.',
  components: '23 components, installed as source.',
  motion: 'Ten roles, each with a capped duration.',
}
function Sections() {
  const tab = TAB_ITEMS[useStep(3, 8, 5)].value
  return (
    <Tile uses={['Tabs']}>
      <Tabs aria-label="Package contents" items={TAB_ITEMS} onValueChange={noop} value={tab}>
        <p className={styles.panelText}>{PANELS[tab]}</p>
      </Tabs>
    </Tile>
  )
}

/*
 * Notices take turns in one place: the current one leaves on Toast's exit
 * while the next arrives on its entrance, both in one grid cell so the tile
 * keeps its height.
 */
const NOTICES = [
  { title: 'Palette saved', description: '3 colours added to Brand.', tone: 'success' as const },
  { title: 'Import failed', description: 'The file is not valid DTCG.', tone: 'error' as const },
  { title: 'Sync paused', description: 'Figma is not reachable.', tone: 'warning' as const },
]
function Notices() {
  const step = useStep(NOTICES.length, 11, 2)
  const previous = (step + NOTICES.length - 1) % NOTICES.length
  return (
    <Tile uses={['Toast']}>
      <div className={styles.slot}>
        {NOTICES.map((notice, i) =>
          i === step || i === previous ? (
            <Toast
              data-state={i === step ? 'open' : 'closed'}
              description={notice.description}
              key={notice.title}
              title={notice.title}
              tone={notice.tone}
            />
          ) : null,
        )}
      </div>
    </Tile>
  )
}

function Empty() {
  return (
    <Tile uses={['EmptyState', 'Button']}>
      <EmptyState
        action={
          <Button size="sm" variant="primary">
            Add a colour
          </Button>
        }
        description="Add by hex or extract from an image."
        headingLevel={3}
        icon={<Icon d={ICONS.inbox} />}
        title="No colours yet"
      />
    </Tile>
  )
}

/* The answer moves between the three options. */
const ANSWERS = [
  { label: 'Yes', value: 'yes' },
  { label: 'Partly', value: 'partly' },
  { label: 'No', value: 'no' },
]
function Feedback() {
  const answer = ANSWERS[useStep(3, 7, 4)].value
  return (
    <Tile uses={['RadioGroup', 'Textarea', 'Button']}>
      <div className={styles.stack}>
        <RadioGroup
          label="Did this page help?"
          name="helpful"
          onChange={noop}
          options={ANSWERS}
          orientation="horizontal"
          value={answer}
        />
        <Textarea label="What was missing?" onChange={noop} rows={3} value="An example with a form." />
        <Button variant="primary">Send feedback</Button>
      </div>
    </Tile>
  )
}

function Toolbar() {
  return (
    <Tile uses={['IconButton', 'Spinner', 'Button']}>
      <div className={styles.row}>
        <IconButton icon={<Icon d={ICONS.bold} />} label="Bold" variant="ghost" />
        <IconButton icon={<Icon d={ICONS.italic} />} label="Italic" variant="ghost" />
        <IconButton icon={<Icon d={ICONS.link} />} label="Link" variant="ghost" />
        <span className={styles.saving}>
          <Spinner size="sm" />
          Saving
        </span>
        <Button size="sm" variant="primary">
          Publish
        </Button>
      </div>
    </Tile>
  )
}

/*
 * The first Select is used as a person would use it: it opens, the highlight
 * steps to the next format, that format is chosen and the panel closes. The
 * fields below are what the open panel lies over, inside the card.
 */
const FORMATS = [
  { label: 'CSS custom properties', value: 'css' },
  { label: 'DTCG JSON', value: 'dtcg' },
  { label: 'TypeScript', value: 'ts' },
]
function Export() {
  const [format, setFormat] = useState('css')
  const current = useRef(format)
  current.current = format
  const ref = useRef<HTMLDivElement>(null)
  const tick = useContext(Clock)
  const step = Math.floor((tick + 6) / 4) % 4

  useEffect(() => {
    const root = ref.current
    if (!root || tick === 0) return
    const trigger = root.querySelector<HTMLElement>('[role="combobox"]')
    const open = trigger?.getAttribute('aria-expanded') === 'true'
    if (step === 1 && !open) trigger?.click()
    if (step < 2 || !open) return
    const options = [...root.querySelectorAll<HTMLElement>('[role="option"]')]
    const next = options[(FORMATS.findIndex(f => f.value === current.current) + 1) % FORMATS.length]
    if (step === 2) next?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: root }))
    if (step === 3) next?.click()
  }, [step, tick])

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

const COLUMNS: ComponentType[][] = [
  [SignIn, Team, Toolbar, Sections],
  [Notifications, Empty, Export],
  [Deploy, Notices, Feedback],
]

/*
 * One column of the marquee. The first set is measured, and the set is
 * repeated until one window plus one set is always covered, so the track can
 * move by exactly one set and restart on an identical frame. The duration
 * follows the set's height, so every column moves at the same speed.
 */
function Column({ tiles, still }: { tiles: ComponentType[]; still: boolean }) {
  const column = useRef<HTMLDivElement>(null)
  const set = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ set: 0, copies: 1 })

  useLayoutEffect(() => {
    if (still || !column.current || !set.current) return
    // The window is the fixed-height box the columns sit in, not the column:
    // the column grows with every copy, and measuring it added copies without
    // end.
    const frame = column.current.parentElement
    const measure = () => {
      const setHeight = set.current?.offsetHeight ?? 0
      const windowHeight = frame?.offsetHeight ?? 0
      if (setHeight > 0) setSize({ set: setHeight, copies: Math.ceil(windowHeight / setHeight) + 1 })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(set.current)
    if (frame) observer.observe(frame)
    return () => observer.disconnect()
  }, [still])

  const moving = !still && size.set > 0
  const style = moving
    ? ({ '--set-height': `${size.set}px`, '--wall-duration': `${size.set / SPEED}s` } as CSSProperties)
    : undefined

  const scenes = (key: string) => tiles.map(Scene => <Scene key={`${key}-${Scene.name}`} />)

  return (
    <div className={styles.column} ref={column}>
      <div className={styles.track} data-moving={moving || undefined} style={style}>
        <div className={styles.set} ref={set}>
          {scenes('a')}
        </div>
        {moving &&
          Array.from({ length: size.copies }, (_, i) => (
            <div aria-hidden="true" className={styles.set} inert key={i}>
              {scenes(`c${i}`)}
            </div>
          ))}
      </div>
    </div>
  )
}

export function Wall() {
  const [tick, setTick] = useState(0)
  const [still, setStill] = useState(true)

  useEffect(() => {
    const narrow = window.matchMedia('(max-width: 40rem)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setStill(motionReduced() || narrow.matches)
    update()
    narrow.addEventListener('change', update)
    reduced.addEventListener('change', update)
    return () => {
      narrow.removeEventListener('change', update)
      reduced.removeEventListener('change', update)
    }
  }, [])

  useEffect(() => {
    if (still) return
    const id = setInterval(() => setTick(t => t + 1), TICK)
    return () => clearInterval(id)
  }, [still])

  return (
    // The expressive mode: haus's own slower, softer curves for every role,
    // scoped to the wall, while the rest of the site keeps the standard ones.
    <Clock.Provider value={tick}>
      <div className={styles.wall} data-haus-motion="expressive" data-still={still || undefined}>
        <div className={styles.columns}>
          {COLUMNS.map((tiles, i) => (
            <Column key={i} still={still} tiles={tiles} />
          ))}
        </div>
      </div>
    </Clock.Provider>
  )
}
