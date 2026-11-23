import { RootProvider } from 'fumadocs-ui/provider/next'
import type { Metadata } from 'next'
// global.css first: it declares Tailwind's layers, and between cascade layers
// the one declared last wins. Imported after them, haus.components beats
// Tailwind's base reset, which otherwise zeroes every component's padding.
import './global.css'
// The components render with haus's own tokens and stylesheets. Imported here
// rather than from global.css because Tailwind's import pass leaves the token
// barrel's own @imports out of order.
import '@hipuku/tokens/index.css'
import 'haus-components/styles.css'

export const metadata: Metadata = {
  title: { default: 'haus', template: '%s · haus' },
  description: 'The haus design system: components, tokens and how to install them.',
}

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        {/* `data-theme` as well as fumadocs's `class`: it is haus's own switch
            (brand-dark.css), so the components follow the site's toggle rather
            than staying light on a dark page. */}
        <RootProvider theme={{ attribute: ['class', 'data-theme'] }}>{children}</RootProvider>
      </body>
    </html>
  )
}
