import { redirect } from 'next/navigation'

// The docs are the site. A landing page comes with the foundations pages (3.3).
export default function HomePage() {
  redirect('/docs')
}
