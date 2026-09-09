import React from 'react'
import type { Size } from '../../types'
import styles from './Tabs.module.css'

export type TabsSize = Size

/**
 * The two shapes a tablist takes, and they are shapes rather than weights.
 *
 * `underline` is haus's original and stays the default, so nothing existing
 * moves. `segmented` is a bordered group with the selected tab filled, which is
 * what a two- or three-way mode switch reads as: core's editor toggles between
 * Write and Preview, and a row of underlined words does not say "these are the
 * two states of one control" the way a filled segment does.
 *
 * Deliberately **not** the shared `Appearance` union. That is
 * `'subtle' | 'solid'` and Badge and Toast spend it on fill weight. Reusing the
 * name here would put two unrelated meanings on one type and the compiler would
 * accept every wrong combination of them.
 */
export type TabsAppearance = 'underline' | 'segmented'

export interface TabItem {
  /** Stable identity, and what `onValueChange` hands back. */
  value: string
  label: React.ReactNode
  disabled?: boolean
}

interface TabsBaseProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: TabItem[]
  value: string
  onValueChange: (value: string) => void
  size?: TabsSize
  appearance?: TabsAppearance
  /** Lands on the tablist rather than the wrapper, so the label a screen reader
   *  reads for the tab group is the one the caller wrote. */
  tabListClassName?: string
}

/* A tablist with no accessible name is announced as "tab list" and nothing
   else, which is no help at all when a screen has two. Same shape as Modal. */
type TabsLabel =
  | { 'aria-label': string; 'aria-labelledby'?: never }
  | { 'aria-label'?: never; 'aria-labelledby': string }

/**
 * Who renders the panel.
 *
 * The default is that Tabs does, and that stays the default: a consumer who has
 * not thought about it should get a correct one, which is the whole argument for
 * this component existing.
 *
 * `panelId` is for a consumer whose two halves are not adjacent, and that is not
 * an exotic layout. core's decision editor puts the Write / Preview switch in a
 * **sticky toolbar** and the content it controls in the **document sheet**
 * further down the page, with the whole editor form in between. Adopting Tabs
 * meant moving the entire editor body inside the toolbar's wrapper, a real
 * layout change for a component whose job is two buttons and an `aria-controls`,
 * so core kept a hand-rolled tablist and none of the contract. haus#67.
 *
 * With `panelId`, Tabs renders no panel and the selected tab's `aria-controls`
 * points at the element the caller renders. The roving tabindex, the arrow keys,
 * Home and End, and the wiring are unchanged, which is the part worth having and
 * the part every product gets wrong.
 *
 * The caller then owns `role="tabpanel"`, `aria-labelledby` pointing back at the
 * selected tab, and `tabIndex={0}`. That is stated in the prop docs rather than
 * assumed, because a consumer who takes the panel and gives it no role has
 * bought the same nothing they had before.
 *
 * Decision 0022: a component may own a subtree only when it owns every part of
 * it. Decision 0023 is why the two halves are exported by name.
 */
export type TabsOwnPanelProps = TabsBaseProps & {
  panelId?: never
  /** What the panel Tabs renders contains. */
  children?: React.ReactNode
}

export type TabsRemotePanelProps = TabsBaseProps & {
  /**
   * The id of a panel the caller renders. Tabs renders none, and the selected
   * tab's `aria-controls` points here.
   *
   * The caller's element must carry `role="tabpanel"`, `tabIndex={0}` and
   * `aria-labelledby` pointing at the selected tab. Use `tabIdFor(id, value)`
   * for that last one, which is why `id` is required on this half: tab ids are
   * `useId`-generated otherwise and a caller cannot know them.
   */
  panelId: string
  /** Required here, so the tab ids are computable. See `tabIdFor`. */
  id: string
  children?: never
}

export type TabsProps = (TabsOwnPanelProps | TabsRemotePanelProps) & TabsLabel

/**
 * The id of one tab, for a caller wiring `aria-labelledby` on its own panel.
 *
 * A published function rather than a documented string template, because a
 * template in prose is a contract nothing checks: the caller writes it once,
 * Tabs changes its scheme, and the panel silently stops being labelled. This is
 * the same reasoning as exporting a union's halves rather than letting each
 * consumer write the same `Extract`.
 */
export const tabIdFor = (id: string, value: string) => `${id}-tab-${value}`

/**
 * A tablist, and the panel it controls.
 *
 * All three products build one. None of them builds the contract: measured
 * across core, drift and vault on 2026-09-05 there are three tablists, **zero
 * `role="tabpanel"`, zero `aria-controls` from a tab to its panel, and zero
 * arrow-key handling.** Every one announces itself as a tablist and then
 * delivers none of what that word promises: the keys do nothing, and the
 * region that changes is not identified as the thing the tab controls.
 *
 * drift's is the one that matters: its audit screen *is* a tablist, seven tabs
 * across Overview, Colour, Contrast, Type, Spacing, Radius and Shadow, and it
 * is the screen the product is judged on.
 *
 * The panel is rendered here rather than left to the caller, and that is the
 * design decision. A component that emitted only the tabs would let the same
 * defect straight back in: the wiring between a tab and its panel is precisely
 * what all three got wrong, so the component owns both ends or it is not worth
 * having.
 *
 * Data-driven, like `RadioGroup` and `Select`, rather than a compound
 * `<Tabs><Tab/></Tabs>`. It is the shape the package already uses, and it is
 * also the shape drift already wrote by hand.
 *
 * Selection follows focus. The APG allows either, and automatic activation is
 * right when showing a panel is cheap: which it is here, because the caller
 * renders only the active one. If a panel ever costs a fetch, that is the
 * moment to add manual activation, not before.
 */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    items,
    value,
    onValueChange,
    size = 'md',
    appearance = 'underline',
    className,
    tabListClassName,
    children,
    panelId: remotePanelId,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  },
  ref,
) {
  const generated = React.useId()
  /* `id` is required alongside `panelId` precisely so this is stable and the
     caller can compute the same tab ids with `tabIdFor`. */
  const base = id ?? generated
  const tabId = (v: string) => tabIdFor(base, v)
  const ownPanelId = (v: string) => `${base}-panel-${v}`

  const enabled = items.filter((t) => !t.disabled)
  const active = items.find((t) => t.value === value)

  /* Arrow keys move between tabs, Home and End jump to the ends, and disabled
     tabs are skipped rather than landed on and ignored.
     
     Movement is in document order. Right-to-left ought to reverse it, and does
     not: the package runs its component tests with `css: false`, so there is no
     computed direction to read and no honest way to assert the behaviour here.
     The same boundary logical-properties.test.ts draws for the visual half. */
  const move = (e: React.KeyboardEvent, index: number) => {
    const last = enabled.length - 1
    // Declared without a starting value on purpose: every branch that reaches
    // the assignment sets it, and the default returns, so an initialiser would
    // be a value that is never read.
    let next: number

    switch (e.key) {
      case 'ArrowRight': next = index === last ? 0 : index + 1; break
      case 'ArrowLeft':  next = index === 0 ? last : index - 1; break
      case 'Home':       next = 0; break
      case 'End':        next = last; break
      default: return
    }

    e.preventDefault()
    const target = enabled[next]
    if (!target) return
    onValueChange(target.value)
    /* Focus follows selection rather than waiting for a re-render to move it.
       The tab is already in the document; only its tabindex changes. */
    document.getElementById(tabId(target.value))?.focus()
  }

  /* Which panel a given tab controls, or nothing.

     Only the active panel is ever in the document, so every inactive tab used
     to point `aria-controls` at an id that did not exist: three tabs, one
     panel, two dangling IDREFs. In the component whose stated reason for owning
     both ends is that "the wiring between a tab and its panel is precisely what
     all three products got wrong".

     Nothing caught it. axe passes the suite, because `aria-valid-attr-value`
     does not resolve `aria-controls` against the document here, and the
     component's own tests asserted the attribute was present rather than that
     it resolved. Present and correct are different assertions and only one of
     them was being made.

     An omitted `aria-controls` is valid; a broken IDREF is not. So it is set
     where the panel exists and left off where it does not. */
  const controls = (v: string): string | undefined => {
    if (remotePanelId) return v === value ? remotePanelId : undefined
    return v === active?.value ? ownPanelId(v) : undefined
  }

  return (
    <div
      ref={ref}
      id={id}
      className={[styles.tabs, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <div
        role="tablist"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={[styles.list, styles[appearance], styles[size], tabListClassName].filter(Boolean).join(' ')}
      >
        {items.map((item) => {
          const selected = item.value === value
          return (
            <button
              key={item.value}
              id={tabId(item.value)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={controls(item.value)}
              disabled={item.disabled}
              /* Roving tabindex. Without it every tab is its own tab stop, so a
                 keyboard user crosses drift's seven one at a time to reach the
                 panel: which is the behaviour all three products ship today,
                 and the opposite of what the pattern is for. */
              tabIndex={selected ? 0 : -1}
              className={[styles.tab, selected ? styles.selected : ''].filter(Boolean).join(' ')}
              onClick={() => onValueChange(item.value)}
              onKeyDown={(e) => move(e, enabled.findIndex((t) => t.value === item.value))}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {active && !remotePanelId && (
        <div
          role="tabpanel"
          id={ownPanelId(active.value)}
          aria-labelledby={tabId(active.value)}
          /* Focusable so that a panel holding no controls is still reachable
             after Tab leaves the tablist. A tabpanel with nothing tabbable in
             it is otherwise a region a keyboard user cannot get into to read. */
          tabIndex={0}
          className={styles.panel}
        >
          {children}
        </div>
      )}
    </div>
  )
})
