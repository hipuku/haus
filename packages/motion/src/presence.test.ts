import { describe, expect, it } from 'vitest'
import { isMounted, presence, type PresenceEvent, type PresenceState } from './presence.js'

const run = (start: PresenceState, events: PresenceEvent[]) => events.reduce(presence, start)

describe('presence', () => {
  it('opens through entering to entered, and closes through exiting to exited', () => {
    expect(run('exited', ['open', 'animation-end'])).toBe('entered')
    expect(run('entered', ['close', 'animation-end'])).toBe('exited')
  })

  it('turns a close into an open mid-exit, without passing through exited (FR-S22)', () => {
    expect(run('entered', ['close', 'open'])).toBe('entering')
  })

  it('turns an open into a close mid-enter', () => {
    expect(run('exited', ['open', 'close'])).toBe('exiting')
  })

  it('ignores events that do not apply', () => {
    expect(presence('exited', 'close')).toBe('exited')
    expect(presence('exited', 'animation-end')).toBe('exited')
    expect(presence('entered', 'open')).toBe('entered')
    expect(presence('entered', 'animation-end')).toBe('entered')
  })

  it('keeps the surface mounted until its exit has finished', () => {
    expect(isMounted('entering')).toBe(true)
    expect(isMounted('entered')).toBe(true)
    expect(isMounted('exiting')).toBe(true)
    expect(isMounted('exited')).toBe(false)
  })
})
