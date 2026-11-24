import React from 'react'
import { Popover, type PopoverAlign, type PopoverPlacement, type PopoverWidth } from '../Popover'
import styles from './Menu.module.css'

/**
 * A list of actions opened from a trigger.
 *
 * Three products drew their own: vault's `MenuOption` rows inside its popover
 * menus, core's `UserMenu`, and maple's `Menu`, `MenuLink`, `AccountMenu` and
 * `StudioMenu`. Decision 7's two-product rule, three times over (4.5 audit).
 *
 * It is a `Popover` with `role="menu"`, so placement, dismissal, focus return
 * and motion are Popover's. What it adds is the menu pattern: focus moves to
 * the first item on open, the arrow keys move between items (Home and End jump
 * to the ends), disabled items are skipped, and choosing an item closes the
 * menu and puts focus back on the trigger.
 */
export interface MenuProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'role' | 'aria-label' | 'aria-labelledby'
> {
  open: boolean
  onClose: () => void
  /** The button that opens the menu. Focus returns here when it closes. */
  triggerRef: React.RefObject<HTMLElement | null>
  /** The menu's name, which a screen reader announces with it. */
  'aria-label': string
  align?: PopoverAlign
  placement?: PopoverPlacement
  width?: PopoverWidth
  portal?: boolean
}

interface MenuContextValue {
  close: () => void
}

const MenuContext = React.createContext<MenuContextValue | null>(null)

/** The enabled items, in document order. */
const itemsIn = (panel: HTMLElement | null) =>
  panel
    ? Array.from(panel.querySelectorAll<HTMLElement>('[role="menuitem"]')).filter(
        item => item.getAttribute('aria-disabled') !== 'true',
      )
    : []

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(function Menu(
  {
    open,
    onClose,
    triggerRef,
    'aria-label': ariaLabel,
    align = 'start',
    placement = 'bottom',
    width = 'auto',
    portal = false,
    className,
    children,
    onKeyDown: callerKeyDown,
    ...rest
  },
  ref,
) {
  const panelRef = React.useRef<HTMLDivElement | null>(null)
  const setPanel = React.useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  /* Focus moves into the menu when it opens: a menu is navigated from its
     items, not from its trigger. */
  React.useEffect(() => {
    if (open) itemsIn(panelRef.current)[0]?.focus()
  }, [open])

  const close = React.useCallback(() => {
    onClose()
    triggerRef.current?.focus()
  }, [onClose, triggerRef])

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    callerKeyDown?.(e)
    if (e.defaultPrevented) return
    const items = itemsIn(panelRef.current)
    if (items.length === 0) return
    const index = items.indexOf(document.activeElement as HTMLElement)
    let next: number
    switch (e.key) {
      case 'ArrowDown':
        next = index < 0 || index === items.length - 1 ? 0 : index + 1
        break
      case 'ArrowUp':
        next = index <= 0 ? items.length - 1 : index - 1
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = items.length - 1
        break
      default:
        return
    }
    e.preventDefault()
    items[next]?.focus()
  }

  const context = React.useMemo(() => ({ close }), [close])

  return (
    <Popover
      {...rest}
      ref={setPanel}
      open={open}
      onClose={onClose}
      triggerRef={triggerRef}
      role="menu"
      aria-label={ariaLabel}
      align={align}
      placement={placement}
      width={width}
      portal={portal}
      className={[styles.menu, className].filter(Boolean).join(' ')}
      onKeyDown={onKeyDown}
    >
      <MenuContext.Provider value={context}>{children}</MenuContext.Provider>
    </Popover>
  )
})

export interface MenuItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  /** Runs when the item is chosen, by click, Enter or Space. The menu then closes. */
  onSelect?: () => void
  /** A glyph before the label, sized to it. */
  icon?: React.ReactNode
  /** A keyboard shortcut shown at the end, for reference. It binds nothing. */
  shortcut?: string
  /** `error` for an action that destroys something. */
  tone?: 'neutral' | 'error'
}

/**
 * One action. Start-aligned, so a column of them reads down its left edge; the
 * Buttons that stood in for these centred their labels (owner, 4.5).
 *
 * `aria-disabled` rather than `disabled`, so a disabled item is still found
 * and announced by a screen reader moving through the menu, and is skipped by
 * the arrow keys.
 */
export const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem(
  { onSelect, icon, shortcut, tone = 'neutral', disabled, className, children, onClick, ...rest },
  ref,
) {
  const menu = React.useContext(MenuContext)
  return (
    <button
      ref={ref}
      type="button"
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      className={[styles.item, tone === 'error' ? styles.error : '', className].filter(Boolean).join(' ')}
      onClick={e => {
        if (disabled) return
        onClick?.(e)
        onSelect?.()
        menu?.close()
      }}
      {...rest}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.label}>{children}</span>
      {shortcut && (
        <kbd className={styles.shortcut} aria-hidden="true">
          {shortcut}
        </kbd>
      )}
    </button>
  )
})

/** A rule between groups of items. */
export const MenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function MenuSeparator({ className, ...rest }, ref) {
    return (
      <div ref={ref} role="separator" className={[styles.separator, className].filter(Boolean).join(' ')} {...rest} />
    )
  },
)

/**
 * A heading over a group of items, or the account line at the top of a user
 * menu (core's `UserMenu` draws one). Not focusable and not an item.
 */
export const MenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function MenuLabel(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} role="presentation" className={[styles.menuLabel, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  )
})
