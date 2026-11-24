'use client'

import type { ReactNode } from 'react'
import { Callout, type CalloutProps } from 'haus-components'

/**
 * A page notice, drawn with the system's own Callout.
 *
 * It exists only to put a client boundary around it: `Callout` is part of a
 * client library and several of the places that need a notice, the install
 * block among them, read files at build time and so are server components.
 * The site should not be drawing its own notice next to a published one.
 */
export function Notice({ children, tone = 'info' }: { children: ReactNode; tone?: CalloutProps['tone'] }) {
  return <Callout tone={tone}>{children}</Callout>
}
