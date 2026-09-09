import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Tabs, tabIdFor, type TabItem } from './Tabs'

const ITEMS: TabItem[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'colour', label: 'Colour' },
  { value: 'contrast', label: 'Contrast' },
]

function Harness({ items = ITEMS, ...props }: { items?: TabItem[]; size?: 'sm' | 'md' | 'lg' }) {
  const [value, setValue] = React.useState(items[0]!.value)
  return (
    <Tabs items={items} value={value} onValueChange={setValue} aria-label="Audit sections" {...props}>
      Panel for {value}
    </Tabs>
  )
}

describe('Tabs', () => {
  it('renders a tablist with an accessible name', () => {
    render(<Harness />)
    expect(screen.getByRole('tablist', { name: 'Audit sections' })).toBeInTheDocument()
  })

  it('renders a real tabpanel, named by its tab', () => {
    // Measured across core, drift and vault: three tablists, zero
    // role="tabpanel", zero aria-controls. Every one announces itself as a
    // tablist and the region it controls is not identified as anything.
    render(<Harness />)
    const panel = screen.getByRole('tabpanel', { name: 'Overview' })
    expect(panel).toHaveTextContent('Panel for overview')

    const tab = screen.getByRole('tab', { name: 'Overview' })
    expect(tab).toHaveAttribute('aria-controls', panel.id)
    expect(panel).toHaveAttribute('aria-labelledby', tab.id)
  })

  it('marks exactly one tab selected', () => {
    render(<Harness />)
    const selected = screen.getAllByRole('tab').filter(t => t.getAttribute('aria-selected') === 'true')
    expect(selected).toHaveLength(1)
    expect(selected[0]).toHaveAccessibleName('Overview')
  })

  it('is one tab stop, not one per tab', () => {
    // Roving tabindex. Without it a keyboard user crosses drift's seven tabs
    // one at a time to reach the panel, which is what all three ship today.
    render(<Harness />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs.map(t => t.getAttribute('tabindex'))).toEqual(['0', '-1', '-1'])
  })

  it('moves selection with the arrow keys', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.tab()
    expect(document.activeElement).toHaveAccessibleName('Overview')

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Colour' })).toHaveAttribute('aria-selected', 'true')
    expect(document.activeElement).toHaveAccessibleName('Colour')
    expect(screen.getByRole('tabpanel', { name: 'Colour' })).toBeInTheDocument()

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true')
  })

  it('wraps at both ends', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.tab()
    await user.keyboard('{ArrowLeft}')
    expect(document.activeElement).toHaveAccessibleName('Contrast')

    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toHaveAccessibleName('Overview')
  })

  it('jumps to the ends with Home and End', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.tab()

    await user.keyboard('{End}')
    expect(document.activeElement).toHaveAccessibleName('Contrast')

    await user.keyboard('{Home}')
    expect(document.activeElement).toHaveAccessibleName('Overview')
  })

  it('skips a disabled tab rather than landing on it', async () => {
    const user = userEvent.setup()
    render(
      <Harness
        items={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B', disabled: true },
          { value: 'c', label: 'C' },
        ]}
      />,
    )
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toHaveAccessibleName('C')
  })

  it('reaches the panel with one Tab from the tablist', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.tab()
    await user.tab()
    expect(document.activeElement).toHaveAttribute('role', 'tabpanel')
  })

  it('selects on click', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('tab', { name: 'Contrast' }))
    expect(screen.getByRole('tabpanel', { name: 'Contrast' })).toHaveTextContent('Panel for contrast')
  })

  it('applies the size class', () => {
    render(<Harness size="lg" />)
    expect(screen.getByRole('tablist').className).toContain('lg')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Harness />)
    expect((await axe(container)).violations).toEqual([])
  })
})

describe('appearance (haus#60)', () => {
  const items = [
    { value: 'write', label: 'Write' },
    { value: 'preview', label: 'Preview' },
  ]

  it('defaults to underline, so nothing existing moves', () => {
    render(
      <Tabs items={items} value="write" onValueChange={() => {}} aria-label="Mode" />,
    )
    expect(screen.getByRole('tablist').className).toMatch(/underline/)
  })

  it('takes the segmented appearance', () => {
    render(
      <Tabs
        items={items}
        value="write"
        onValueChange={() => {}}
        appearance="segmented"
        aria-label="Mode"
      />,
    )
    const list = screen.getByRole('tablist')
    expect(list.className).toMatch(/segmented/)
    expect(list.className).not.toMatch(/underline/)
  })

  it('changes nothing about the tab contract', () => {
    // The appearance is a look. If it ever starts deciding behaviour, this is
    // what says so: same roles, same selection, same handler either way.
    const onValueChange = vi.fn()
    render(
      <Tabs
        items={items}
        value="write"
        onValueChange={onValueChange}
        appearance="segmented"
        aria-label="Mode"
      />,
    )
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(2)
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
    fireEvent.click(tabs[1])
    expect(onValueChange).toHaveBeenCalledWith('preview')
  })
})

const THREE: TabItem[] = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
  { value: 'c', label: 'C' },
]

describe('aria-controls resolves', () => {
  it('points every tab at an element that exists', () => {
    // Only the active panel is ever rendered, so every inactive tab used to
    // point at an id that was not in the document: three tabs, one panel, two
    // dangling IDREFs, in the component that exists to own this wiring.
    render(
      <Tabs aria-label="Sections" value="a" onValueChange={() => {}} items={THREE}>
        body
      </Tabs>,
    )
    const dangling = screen
      .getAllByRole('tab')
      .map(t => t.getAttribute('aria-controls'))
      .filter((id): id is string => id !== null)
      .filter(id => !document.getElementById(id))
    expect(dangling, 'aria-controls pointing at absent elements').toEqual([])
  })

  it('sets aria-controls on the selected tab and omits it elsewhere', () => {
    // An omitted aria-controls is valid; a broken IDREF is not.
    render(
      <Tabs aria-label="Sections" value="b" onValueChange={() => {}} items={THREE}>
        body
      </Tabs>,
    )
    const [a, b, c] = screen.getAllByRole('tab')
    expect(b).toHaveAttribute('aria-controls')
    expect(document.getElementById(b!.getAttribute('aria-controls')!)).toHaveAttribute('role', 'tabpanel')
    expect(a).not.toHaveAttribute('aria-controls')
    expect(c).not.toHaveAttribute('aria-controls')
  })
})

describe('panelId, a panel the caller renders', () => {
  const Remote = ({ value = 'a' }: { value?: string }) => (
    <>
      <Tabs
        id="editor"
        aria-label="Editor mode"
        value={value}
        onValueChange={() => {}}
        items={THREE}
        panelId="editor-sheet"
      />
      <div>an entire editor form in between</div>
      <div id="editor-sheet" role="tabpanel" tabIndex={0} aria-labelledby={tabIdFor('editor', value)}>
        sheet body
      </div>
    </>
  )

  it('renders no panel of its own', () => {
    render(<Remote />)
    // One panel, and it is the caller's.
    const panels = screen.getAllByRole('tabpanel')
    expect(panels).toHaveLength(1)
    expect(panels[0]).toHaveAttribute('id', 'editor-sheet')
  })

  it('points the selected tab at the caller panel', () => {
    render(<Remote value="b" />)
    const [a, b] = screen.getAllByRole('tab')
    expect(b).toHaveAttribute('aria-controls', 'editor-sheet')
    expect(a).not.toHaveAttribute('aria-controls')
    expect(document.getElementById('editor-sheet')).toBeInTheDocument()
  })

  it('gives the caller a computable tab id for aria-labelledby', () => {
    // tabIdFor is published rather than documented as a string template,
    // because a template in prose is a contract nothing checks.
    render(<Remote value="c" />)
    const labelledBy = screen.getByRole('tabpanel').getAttribute('aria-labelledby')!
    expect(labelledBy).toBe(tabIdFor('editor', 'c'))
    expect(document.getElementById(labelledBy)).toHaveAttribute('role', 'tab')
  })

  it('keeps the arrow keys and the roving tabindex', () => {
    // The part worth having, and the part every product gets wrong. It must not
    // be what a consumer gives up to own its own panel.
    const onValueChange = vi.fn()
    render(
      <Tabs
        id="editor"
        aria-label="Editor mode"
        value="a"
        onValueChange={onValueChange}
        items={THREE}
        panelId="sheet"
      />,
    )
    const [a, b, c] = screen.getAllByRole('tab')
    expect(a).toHaveAttribute('tabindex', '0')
    expect(b).toHaveAttribute('tabindex', '-1')
    expect(c).toHaveAttribute('tabindex', '-1')

    fireEvent.keyDown(a!, { key: 'ArrowRight' })
    expect(onValueChange).toHaveBeenCalledWith('b')
    fireEvent.keyDown(a!, { key: 'End' })
    expect(onValueChange).toHaveBeenCalledWith('c')
  })

  it('has no axe violations with a remote panel', async () => {
    const { container } = render(<Remote />)
    expect((await axe(container)).violations).toEqual([])
  })

  it('does not typecheck with both children and panelId', () => {
    // @ts-expect-error a panel the caller renders has no children to give Tabs
    const x = <Tabs id="e" aria-label="E" value="a" onValueChange={() => {}} items={THREE} panelId="p">body</Tabs>
    expect(x).toBeTruthy()
  })
})
