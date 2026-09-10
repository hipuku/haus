import React from 'react'
import { childRefOf, mergeRefs } from '../../internal/asChild'
import type { Tone } from '../../types'
import { Spinner } from '../Spinner'
import styles from './IconButton.module.css'

/**
 * Weight, matching Button's. `text` is absent: it is an underlined word, and
 * there is no word here.
 */
export type IconButtonVariant = 'primary' | 'secondary' | 'ghost'

export type IconButtonTone = Tone

/**
 * Three sizes, and each is measured rather than chosen.
 *
 * `md` is 28px, `--haus-control-height-sm`, which is what **both** products
 * already draw their default icon button at: core's `.iconbtn` and vault's
 * `.icon-btn` agree to the pixel, and it is already a haus rung.
 *
 * `sm` is 24px, `--haus-control-height-xs`, added with this component. The
 * products do not agree below `md`: core's smaller step is 22px and vault has
 * 24px and 20px. Two products with three different answers is not evidence for
 * any of them, so haus takes the one that is also a rule. **24px is the WCAG
 * 2.5.8 AA minimum target size**, so core's 22px and vault's 20px are both
 * under the floor and neither should be ported up into the system.
 *
 * `lg` is 36px, `--haus-control-height-md`, the same height as a default
 * `Button`. Added because an icon-only action beside a labelled button, core's
 * settings gear next to its New decision button, has no other way to stand level
 * with it: `md` tops out below `Button`'s `md`, so the pair read as mismatched.
 * The glyph is `icon-lg`, keeping the 6px clearance the smaller sizes have.
 */
export type IconButtonSize = 'sm' | 'md' | 'lg'

interface IconButtonBaseProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /**
   * The icon. Required, and the only child: an icon button with a label is a
   * Button, and passing one here would silently produce a square control with
   * text overflowing it.
   */
  icon: React.ReactNode
  /**
   * What it does, for anyone who cannot see the icon. Required, because the
   * accessible name cannot come from the content the way Button's does: an SVG
   * contributes nothing, so without this the control announces as "button" and
   * nothing else. Both products got this right per-site and neither had
   * anything enforcing it.
   */
  label: string
  variant?: IconButtonVariant
  tone?:    IconButtonTone
  size?:    IconButtonSize
}

export type IconButtonOwnProps = IconButtonBaseProps & {
  asChild?: false
  loading?: boolean
}

export type IconButtonAsChildProps = IconButtonBaseProps & {
  asChild:  true
  loading?: never
  children: React.ReactElement
}

/**
 * `asChild` renders the caller's single child element with IconButton's class
 * and its glyph, rather than a `<button>`.
 *
 * Decision 0022: a component owns its box and never its element. core's
 * workspace-settings gear is a 36px square, icon only, inside a Next `<Link>`,
 * and it was the last element keeping `.btn` and `.btn--icon` alive in core's
 * `globals.css` because neither workaround was acceptable. `Button asChild`
 * plus a class to square it is a consumer overriding haus's geometry, which is
 * what that migration existed to delete, and it silently disagrees with this
 * component about what an icon button's box is. haus#70.
 *
 * `loading` is absent from the `asChild` half, exactly as on Button: the
 * spinner replaces the glyph, and a link that is permanently busy announces a
 * wait that will never end.
 *
 * **The glyph replaces the child's children rather than being appended to
 * them**, which is the question haus#70 raised and Button never had to answer.
 * Button's children are the caller's, so it appends. Here they are not: `icon`
 * is the content and this component's whole contract is that it is the *only*
 * content, which `Omit<..., 'children'>` already states for the other half. A
 * caller who puts text in the child wants a Button.
 *
 * `label` still applies and still lands as `aria-label`. The child supplies the
 * element, not the name, and an anchor wrapping an SVG has no accessible name
 * without it.
 */
export type IconButtonProps = IconButtonOwnProps | IconButtonAsChildProps

/**
 * A control that is an icon and nothing else.
 *
 * Promoted on evidence, decision 0013, and the evidence had to be found by
 * behaviour rather than by name: `PORTFOLIO.md` 13.5 recorded core as having
 * none because core's is a CSS class, `.iconbtn`, and not a component file, so
 * a filename search could not see it. Measured properly, core has 7 sites and
 * vault has a full `.icon-btn` set, and **both independently grew a size axis
 * and a tone axis**, which is the same pair Button already carries.
 *
 * Button cannot cover it: Button is a labelled control with inset padding and a
 * 36px minimum, and an icon passed as its only child gives the wrong box and
 * the wrong target size.
 */
export const IconButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, IconButtonProps>(
  function IconButton(props, ref) {
    const {
      icon,
      label,
      variant = 'secondary',
      tone    = 'neutral',
      size    = 'md',
      disabled,
      className,
      ...rest
    } = props

    // Read off the union rather than destructured above: the `asChild` half
    // types `loading` as `never`, and a default in the pattern would widen it
    // back. Same shape as Button.
    const asChild = props.asChild === true
    const loading = props.asChild === true ? false : props.loading ?? false

    // `rest` still holds the discriminant and the props read off the union, and
    // every one of them would land on the DOM as an unknown attribute.
    const {
      asChild:  _asChild,
      loading:  _loading,
      children: _children,
      ...domProps
    } = rest as Record<string, unknown>

    const cls = [
      styles.iconButton,
      styles[variant],
      tone !== 'neutral' ? styles[tone] : '',
      styles[size],
      className,
    ].filter(Boolean).join(' ')

    const isDisabled = disabled || loading

    const glyph = <span className={styles.glyph} aria-hidden="true">{icon}</span>

    if (asChild) {
      const child = React.Children.only(props.children as React.ReactElement)
      const childProps = child.props as { className?: string }
      return React.cloneElement(
        child,
        {
          // IconButton's classes first so the child's own className wins a
          // collision: the caller is closer to the problem than the system is.
          className: [cls, childProps.className].filter(Boolean).join(' '),
          ref: mergeRefs(ref as React.Ref<unknown>, childRefOf(child)),
          // The child supplies the element, not the name. An anchor wrapping an
          // SVG announces as a link and nothing else without this.
          'aria-label': label,
          ...domProps,
        } as Partial<unknown> & React.Attributes,
        // The glyph *replaces* the child's children rather than being appended.
        // Button appends because its children are the caller's; here they are
        // not. `icon` is the content, and the other half of this union states
        // that by omitting `children` from the element attributes entirely.
        glyph,
      )
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={cls}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading || undefined}
        // The name comes from here, never from the icon.
        aria-label={label}
        {...domProps}
      >
        {loading
          ? <Spinner size="text" announcedBy="the button's aria-busy state" />
          : glyph}
      </button>
    )
  },
)
