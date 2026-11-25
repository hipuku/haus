'use client'

import { useState, type ReactNode } from 'react'
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
  Tooltip,
} from 'haus-components'
import styles from './wall.module.css'

/*
 * The components in use, as a wall of small screens.
 *
 * Each tile is a fragment of an app built from the published components and
 * nothing else: a sign-in form, a settings group, a deploy status. They are
 * live, so a reader can type, switch, select and tab through them, and the
 * mode switch in the header repaints every one. The caption under a tile names
 * the components in it and links to their pages.
 *
 * The columns drift, in alternate directions, so the page shows more than
 * fits in it. The drift is ambient rather than a transition, so no motion
 * role's cap applies to it; it is linear, slow, and stops:
 *
 * - on hover and on keyboard focus anywhere in the wall, so a tile never
 *   moves under the pointer or the caret
 * - from the Pause button, because content that moves for longer than five
 *   seconds needs a control that stops it (WCAG 2.2.2)
 * - entirely, under `prefers-reduced-motion` or `data-haus-motion="reduced"`,
 *   where the wall is a still grid
 *
 * A column is its tiles twice, so the loop has no seam. The second copy is
 * `inert` and hidden from assistive technology: one set of controls in the tab
 * order and one in the accessibility tree.
 *
 * Overlays are not here. A Modal, Drawer, ConfirmDialog, Popover or Menu is
 * opened from something and covers the page, and a tile cannot show that
 * without either opening over the landing page or faking it.
 */

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
      <Card className={styles.screen}>{children}</Card>
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

function SignIn() {
  return (
    <Tile uses={['Input', 'Checkbox', 'Button']}>
      <form className={styles.stack} onSubmit={event => event.preventDefault()}>
        <Input autoComplete="off" defaultValue="ada@hipuku.dev" label="Email" type="email" />
        <Input autoComplete="off" defaultValue="analytical" label="Password" type="password" />
        <Checkbox defaultChecked label="Keep me signed in" />
        <Button type="submit" variant="primary">
          Sign in
        </Button>
      </form>
    </Tile>
  )
}

function Notifications() {
  return (
    <Tile uses={['Toggle', 'Divider']}>
      <div className={styles.stack}>
        <Toggle defaultChecked description="When someone mentions you" label="Mentions" />
        <Divider spacing="none" />
        <Toggle description="A summary every Monday" label="Weekly digest" />
        <Divider spacing="none" />
        <Toggle defaultChecked description="Deploys and failed checks" label="Builds" />
      </div>
    </Tile>
  )
}

function Team() {
  const people = [
    { name: 'Ada Lovelace', role: 'Owner', status: 'online' as const, tone: 'info' as const },
    { name: 'Grace Hopper', role: 'Admin', status: 'away' as const, tone: 'success' as const },
    { name: 'Alan Turing', role: 'Member', status: 'offline' as const, tone: 'neutral' as const },
  ]
  return (
    <Tile uses={['Avatar', 'Badge']}>
      <ul className={styles.list}>
        {people.map(person => (
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

function Deploy() {
  return (
    <Tile uses={['Callout', 'Button']}>
      <div className={styles.stack}>
        <Callout tone="success">Deployed to production in 41 seconds.</Callout>
        <div className={styles.row}>
          <Button loading variant="secondary">
            Redeploying
          </Button>
          <Button variant="ghost">View logs</Button>
        </div>
      </div>
    </Tile>
  )
}

function Sections() {
  const [tab, setTab] = useState('tokens')
  const panels: Record<string, string> = {
    tokens: '438 custom properties, light and dark.',
    components: '23 components, installed as source.',
    motion: 'Ten roles, each with a capped duration.',
  }
  return (
    <Tile uses={['Tabs']}>
      <Tabs
        aria-label="Package contents"
        items={[
          { label: 'Tokens', value: 'tokens' },
          { label: 'Components', value: 'components' },
          { label: 'Motion', value: 'motion' },
        ]}
        onValueChange={setTab}
        value={tab}
      >
        <p className={styles.panelText}>{panels[tab]}</p>
      </Tabs>
    </Tile>
  )
}

function Notices() {
  return (
    <Tile uses={['Toast']}>
      <div className={styles.stack}>
        <Toast description="3 colours added to Brand." title="Palette saved" tone="success" />
        <Toast description="The file is not valid DTCG." title="Import failed" tone="error" />
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

function Feedback() {
  return (
    <Tile uses={['RadioGroup', 'Textarea', 'Button']}>
      <form className={styles.stack} onSubmit={event => event.preventDefault()}>
        <RadioGroup
          defaultValue="yes"
          label="Did this page help?"
          name="helpful"
          options={[
            { label: 'Yes', value: 'yes' },
            { label: 'Partly', value: 'partly' },
            { label: 'No', value: 'no' },
          ]}
          orientation="horizontal"
        />
        <Textarea label="What was missing?" rows={3} />
        <Button type="submit" variant="secondary">
          Send
        </Button>
      </form>
    </Tile>
  )
}

function Toolbar() {
  return (
    <Tile uses={['IconButton', 'Tooltip', 'Spinner']}>
      <div className={styles.row}>
        <Tooltip content="Bold">
          <IconButton icon={<Icon d={ICONS.bold} />} label="Bold" variant="ghost" />
        </Tooltip>
        <Tooltip content="Italic">
          <IconButton icon={<Icon d={ICONS.italic} />} label="Italic" variant="ghost" />
        </Tooltip>
        <Tooltip content="Link">
          <IconButton icon={<Icon d={ICONS.link} />} label="Link" variant="ghost" />
        </Tooltip>
        <span className={styles.saving}>
          <Spinner size="sm" />
          Saving
        </span>
      </div>
    </Tile>
  )
}

function Export() {
  const [format, setFormat] = useState('css')
  return (
    <Tile uses={['Select', 'Button']}>
      <div className={styles.stack}>
        <Select
          label="Export as"
          onChange={setFormat}
          options={[
            { label: 'CSS custom properties', value: 'css' },
            { label: 'DTCG JSON', value: 'dtcg' },
            { label: 'TypeScript', value: 'ts' },
          ]}
          value={format}
        />
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
  const [paused, setPaused] = useState(false)

  return (
    <div className={styles.wall} data-paused={paused || undefined}>
      <button aria-pressed={paused} className={styles.pause} onClick={() => setPaused(p => !p)} type="button">
        {paused ? 'Play motion' : 'Pause motion'}
      </button>
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
