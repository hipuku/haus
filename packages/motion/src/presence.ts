/**
 * Whether a surface is mounted and which way it is animating, so an exit can
 * finish before the surface leaves the DOM. A plain reducer with no React in
 * it, so the hook that drives it from props and animationend events (added
 * with the first component that needs it) stays thin.
 *
 * Every transition can be interrupted (PRD FR-S22, NFR-10). Opening during a
 * close goes straight to entering, and the CSS transition runs back from
 * wherever the surface is, rather than restarting from closed.
 */
export type PresenceState = 'exited' | 'entering' | 'entered' | 'exiting'

export type PresenceEvent = 'open' | 'close' | 'animation-end'

const NEXT: Record<PresenceState, Partial<Record<PresenceEvent, PresenceState>>> = {
  exited: { open: 'entering' },
  entering: { close: 'exiting', 'animation-end': 'entered' },
  entered: { close: 'exiting' },
  exiting: { open: 'entering', 'animation-end': 'exited' },
}

/** The next state; an event that does not apply leaves the state as it is. */
export function presence(state: PresenceState, event: PresenceEvent): PresenceState {
  return NEXT[state][event] ?? state
}

/** Whether the surface should be in the DOM: everything except fully closed. */
export function isMounted(state: PresenceState): boolean {
  return state !== 'exited'
}
