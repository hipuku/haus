'use client'

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type RefObject,
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
 * - a button's hover, or hover and press, or a field's keyboard focus, one per
 *   screen, through the components' own rules (see useStates)
 * - Select: opens, shows its options and closes, through its own handler
 * - Checkbox `checked`: the box fills and the tick draws
 * - RadioGroup `value`: the dot grows in the newly chosen option
 * - Tabs `value`: the marker slides to the chosen tab
 * - Toast: each notice arrives on its entrance and leaves on its exit, which a
 *   caller runs by setting `data-state="closed"`, as Toast documents
 * - Spinner: spins
 *
 * Avatar, Badge and Callout have no transition for a change of
 * content, so they hold still: swapping their text would be a cut, and a cut
 * presented as motion claims something they do not do.
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

/*
 * A state a screen moves through, applied straight to a component.
 *
 * No pointer is drawn: the component goes into hover, press or keyboard focus
 * and back, through the attributes postcss-pseudo-states.mjs adds beside each
 * `:hover`, `:active` and `:focus-visible`, so what shows is the component's
 * own rule and its own transition. Hover goes on the target and its
 * ancestors, as the browser applies it. A click, where a step has one, is a
 * real click on the component's own handler; it is how the Select opens.
 * Steps follow the shared clock, so every copy of a screen plays the same
 * frame.
 */
type Move = {
  at: ((root: HTMLElement) => Element | null) | null
  hover?: boolean
  press?: boolean
  focus?: boolean
  click?: boolean
  /** Fires the pointer entering the target, for a handler that reads it. */
  enter?: boolean
  /** Clicks the target only if its `aria-expanded` is not already this. */
  expanded?: boolean
}

const STATES = ['hover', 'active', 'focus', 'focus-visible'] as const

const by = (selector: string) => (root: HTMLElement) => root.querySelector(selector)

function useStates(root: RefObject<HTMLElement | null>, script: Move[], every: number, offset = 0) {
  const tick = useContext(Clock)
  const step = Math.floor((tick + offset) / every) % script.length

  useEffect(() => {
    const stage = root.current
    if (!stage || tick === 0) return
    stage.querySelectorAll('*').forEach(node => STATES.forEach(state => node.removeAttribute(`data-pseudo-${state}`)))

    const move = script[step]
    const target = move.at?.(stage)
    if (!target) return
    const chain: Element[] = []
    for (let node: Element | null = target; node && node !== stage; node = node.parentElement) chain.push(node)
    if (move.hover) chain.forEach(node => node.setAttribute('data-pseudo-hover', ''))
    if (move.press) chain.forEach(node => node.setAttribute('data-pseudo-active', ''))
    if (move.focus) {
      target.setAttribute('data-pseudo-focus', '')
      target.setAttribute('data-pseudo-focus-visible', '')
    }
    if (move.enter) target.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: stage }))
    if (move.click) (target as HTMLElement).click()
    if (move.expanded !== undefined && (target.getAttribute('aria-expanded') === 'true') !== move.expanded) {
      ;(target as HTMLElement).click()
    }
    // The script is a constant per screen; the step is what moves it.
  }, [step, tick === 0])
}

/* An arrow pointer, drawn where a hovering pointer would rest. Still. */
function Pointer() {
  return (
    <svg aria-hidden="true" className={styles.pointer} height="20" viewBox="0 0 16 20" width="16">
      <path d="M1 1v15.5l4.2-4 2.9 6.3 2.6-1.2-2.9-6.2H14L1 1z" />
    </svg>
  )
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

/*
 * The email field holds keyboard focus, through its own rule, while the
 * address is typed into it, a character a tick, held, then cleared and typed
 * again. Nothing else on the screen moves.
 */
const EMAIL = 'ada@hipuku.dev'
function SignIn() {
  const tick = useContext(Clock)
  const cycle = EMAIL.length + 10
  const typed = tick === 0 ? EMAIL : EMAIL.slice(0, Math.min(tick % cycle, EMAIL.length))
  return (
    <Tile uses={['Input', 'Checkbox', 'Button']}>
      <div className={styles.stack}>
        <Input
          data-pseudo-focus=""
          data-pseudo-focus-visible=""
          label="Email"
          onChange={noop}
          type="email"
          value={typed}
        />
        <Input label="Password" onChange={noop} type="password" value="analytical" />
        <Checkbox defaultChecked label="Keep me signed in" />
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

/* Nothing moves here. */
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

/*
 * A pointer resting on View logs, the secondary button. It does not move: the
 * button holds its hover state, is pressed, and returns to hover, each
 * through its own rule and its own transition.
 */
const DEPLOY: Move[] = [
  { at: by('[data-demo="logs"]'), hover: true },
  { at: by('[data-demo="logs"]'), hover: true },
  { at: by('[data-demo="logs"]'), hover: true, press: true },
  { at: by('[data-demo="logs"]'), hover: true },
]
function Deploy() {
  const stage = useRef<HTMLDivElement>(null)
  useStates(stage, DEPLOY, 3, 6)
  return (
    <Tile uses={['Callout', 'Button']}>
      <div className={styles.stack} ref={stage}>
        <Callout tone="success">Deployed to production in 41 seconds.</Callout>
        <div className={styles.row}>
          <Button variant="primary">Redeploy</Button>
          <span className={styles.pointed}>
            <Button data-demo="logs" data-pseudo-hover="" variant="secondary">
              View logs
            </Button>
            <Pointer />
          </span>
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

/* A pointer resting on Add a colour while it goes hover, pressed, hover. */
const EMPTY: Move[] = [
  { at: by('[data-demo="add"]'), hover: true },
  { at: by('[data-demo="add"]'), hover: true },
  { at: by('[data-demo="add"]'), hover: true, press: true },
  { at: by('[data-demo="add"]'), hover: true },
]
function Empty() {
  const stage = useRef<HTMLDivElement>(null)
  useStates(stage, EMPTY, 3, 0)
  return (
    <Tile uses={['EmptyState', 'Button']}>
      <div ref={stage}>
        <EmptyState
          action={
            <span className={styles.pointed}>
              <Button data-demo="add" data-pseudo-hover="" size="sm" variant="primary">
                Add a colour
              </Button>
              <Pointer />
            </span>
          }
          description="Add by hex or extract from an image."
          headingLevel={3}
          icon={<Icon d={ICONS.inbox} />}
          title="No colours yet"
        />
      </div>
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

/*
 * A still frame, apart from the Spinner: a pointer resting on Bold, which is
 * in its hover state through its own rule.
 */
function Toolbar() {
  return (
    <Tile uses={['IconButton', 'Spinner', 'Button']}>
      <div className={styles.row}>
        <span className={styles.pointed}>
          <IconButton data-pseudo-hover="" icon={<Icon d={ICONS.bold} />} label="Bold" variant="ghost" />
          <Pointer />
        </span>
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
 * The Select opens, shows its options, and closes. Nothing is chosen, so the
 * value stays where it is. It opens through its own click handler, and
 * scrolls only its own list.
 */
const FORMATS = [
  { label: 'CSS custom properties', value: 'css' },
  { label: 'DTCG JSON', value: 'dtcg' },
  { label: 'TypeScript', value: 'ts' },
]
const EXPORT: Move[] = [
  { at: by('[role="combobox"]'), expanded: false },
  { at: by('[role="combobox"]'), expanded: true },
  { at: by('[role="combobox"]'), expanded: true },
  { at: by('[role="combobox"]'), expanded: false },
]
function Export() {
  const stage = useRef<HTMLDivElement>(null)
  useStates(stage, EXPORT, 4, 5)
  return (
    <Tile uses={['Select', 'Checkbox', 'Button']}>
      <div className={styles.stack} ref={stage}>
        <Select label="Export as" onChange={noop} options={FORMATS} value="dtcg" />
        <Select label="Colour space" onChange={noop} options={[{ label: 'OKLCH', value: 'oklch' }]} value="oklch" />
        <Checkbox checked label="Include the dark mode" onChange={noop} />
        <Button variant="primary">Export</Button>
      </div>
    </Tile>
  )
}

const COLUMNS: ComponentType[][] = [
  [SignIn, Team, Toolbar, Notices],
  [Notifications, Empty, Export],
  [Deploy, Sections, Feedback],
]

/*
 * One column of the marquee. The first set is measured against the window,
 * the fixed-height box the columns sit in, and repeated until one window plus
 * one set is always covered, so the track can move by exactly one set and
 * restart on an identical frame.
 *
 * The movement is a Web Animation with the distance in pixels, rather than a
 * CSS animation reading a custom property in its keyframes, which browsers do
 * not all resolve the same way. If the set's height ever changes, the new
 * animation starts at the same fraction of the cycle as the old one, so the
 * column carries on rather than starting over. The duration follows the
 * height, so every column moves at one speed.
 */
function Column({ tiles, still, reverse }: { tiles: ComponentType[]; still: boolean; reverse: boolean }) {
  const column = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const set = useRef<HTMLDivElement>(null)
  const animation = useRef<Animation | null>(null)
  const [size, setSize] = useState({ set: 0, copies: 0 })

  useLayoutEffect(() => {
    if (still || !column.current || !set.current) return
    const frame = column.current.parentElement
    const measure = () => {
      const setHeight = set.current?.offsetHeight ?? 0
      const windowHeight = frame?.offsetHeight ?? 0
      if (setHeight === 0) return
      const copies = Math.ceil(windowHeight / setHeight) + 1
      setSize(old => (old.set === setHeight && old.copies === copies ? old : { set: setHeight, copies }))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(set.current)
    if (frame) observer.observe(frame)
    return () => observer.disconnect()
  }, [still])

  useLayoutEffect(() => {
    const el = track.current
    if (still || !el || size.set === 0) return
    const duration = (size.set / SPEED) * 1000
    const previous = animation.current
    const progress =
      previous && previous.effect
        ? ((previous.currentTime as number) ?? 0) / (previous.effect.getTiming().duration as number)
        : 0
    previous?.cancel()
    const next = el.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-size.set}px)` }], {
      direction: reverse ? 'reverse' : 'normal',
      duration,
      easing: 'linear',
      iterations: Infinity,
    })
    next.currentTime = (progress % 1) * duration
    animation.current = next
    return () => {
      // Kept for the next run to read its progress; cancelled only when the
      // column stops moving.
      if (still) next.cancel()
    }
  }, [size.set, still, reverse])

  useEffect(() => {
    if (still) {
      animation.current?.cancel()
      animation.current = null
    }
  }, [still])

  const moving = !still && size.set > 0
  const scenes = (key: string) => tiles.map(Scene => <Scene key={`${key}-${Scene.name}`} />)

  return (
    <div className={styles.column} ref={column}>
      <div className={styles.track} ref={track}>
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
            <Column key={i} reverse={i % 2 === 1} still={still} tiles={tiles} />
          ))}
        </div>
      </div>
    </Clock.Provider>
  )
}
