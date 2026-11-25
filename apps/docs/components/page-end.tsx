'use client'

import { Divider } from 'haus-components'

/* The rule between a docs page and the previous and next links after it.
   A client boundary for the same reason as notice.tsx: haus-components is a
   client library and the page is a server component. `not-prose` keeps the
   content's own rule styles off it: it is an <hr> inside the page, and those
   drew a border on top of its fill, two pixels where every other line is one. */
export function PageEnd() {
  return <Divider className="haus-page-end not-prose" spacing="lg" />
}
