import React from 'react'
import { Modal, type ModalProps } from '../Modal'

/**
 * A panel that slides in from the edge of the page, over it: settings, a
 * record's details, a filter set, anything too much for a popover that should
 * not take the reader off the page.
 *
 * It is a Modal anchored to an edge, so it is a dialog in every way that
 * matters and shares Modal's guarantees: focus is trapped and returned, Escape
 * closes it, the page behind does not scroll or shift, and it leaves on its
 * exit animation. It enters on the sheet motion role: a slide from its edge in
 * subtle, a spring in expressive, a fade in place in reduced. vault draws one
 * (`Drawer`), and haus had the sheet motion roles and no component to use them.
 */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

export type DrawerSide = 'start' | 'end'

export type DrawerProps = DistributiveOmit<ModalProps, 'placement'> & {
  /** Which edge it comes from. Logical: `end` is the right edge in a left-to-right page. */
  side?: DrawerSide
}

export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(function Drawer({ side = 'end', ...props }, ref) {
  return <Modal {...(props as ModalProps)} ref={ref} placement={side} />
})
