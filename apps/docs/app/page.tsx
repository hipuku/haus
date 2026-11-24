import { redirect } from 'next/navigation'
import { docsRoute } from '@/lib/shared'

/*
 * There is one front page, and it is the overview.
 *
 * `/` used to be a landing page of its own, with a hero, the component wall
 * and three package cards, while `/docs` carried an overview saying much the
 * same thing. The brand in the header went to one and the first item in the
 * sidebar went to the other, so the site had two front doors into two
 * different rooms. The content is merged into the overview, and this redirect
 * keeps the bare domain working.
 */
export default function Home() {
  redirect(docsRoute)
}
