'use client'

import { Divider } from 'haus-components'

/* The rule between a docs page and the previous and next links after it.
   A client boundary for the same reason as notice.tsx: haus-components is a
   client library and the page is a server component. */
export function PageEnd() {
  return <Divider className="haus-page-end" spacing="lg" />
}
