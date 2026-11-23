import { RootProvider } from 'fumadocs-ui/provider/next'
import type { Metadata } from 'next'
// The components render with haus's own tokens and stylesheets, as a
// consumer's copy would. Imported here rather than from global.css because
// Tailwind's import pass leaves the token barrel's own @imports out of order.
import 'haus-tokens/index.css'
import 'haus-components/styles.css'
import './global.css'

export const metadata: Metadata = {
  title: { default: 'haus', template: '%s · haus' },
  description: 'The haus design system: components, tokens and how to install them.',
}

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  )
}
