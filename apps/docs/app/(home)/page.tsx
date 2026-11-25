import { Landing } from '@/components/home/landing'
import { Wordmark } from '@/components/wordmark'

export const metadata = {
  title: 'haus',
  description:
    'The design system every hipuku app is built on: components you install as source, and the tokens under them.',
}

// The wordmark reads its SVG from disk, so it renders here, on the server,
// and reaches the client landing page as an element.
export default function HomePage() {
  return <Landing wordmark={<Wordmark />} />
}
