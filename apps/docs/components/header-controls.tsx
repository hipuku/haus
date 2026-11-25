'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { useSearchContext } from 'fumadocs-ui/contexts/search'
import { IconButton, Tooltip } from 'haus-components'

/*
 * The header's three controls, as haus's own IconButton.
 *
 * Fumadocs drew these itself: a field-shaped search button, a two-segment mode
 * pill and a bare GitHub glyph, each with its hover mapped to a surface that
 * in dark mode is darker than the page, so nothing changed under the pointer.
 * The secondary IconButton carries its own hover and press in both modes, one
 * size and one radius, so the three read as a set and as the system they
 * document.
 *
 * Each has a Tooltip with its label. The label is already the accessible
 * name; the tooltip is for a sighted reader who does not know the glyph.
 */

const Glyph = ({ children }: { children: React.ReactNode }) => (
  <svg
    aria-hidden="true"
    fill="none"
    height="16"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="16"
  >
    {children}
  </svg>
)

/* The search dialog, the ⌘K binding and the index stay Fumadocs'. Only the
   trigger is ours, and it opens the same dialog. */
export function SearchButton() {
  const { setOpenSearch } = useSearchContext()
  return (
    <Tooltip content="Search (⌘K)">
      <IconButton
        icon={
          <Glyph>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </Glyph>
        }
        label="Search"
        onClick={() => setOpenSearch(true)}
        variant="secondary"
      />
    </Tooltip>
  )
}

/*
 * One button showing the mode it switches to, so its label and its glyph say
 * the same thing. The mode is only known in the browser, so the first render
 * names neither, and the glyph appears once the page has mounted rather than
 * flashing the wrong one.
 */
export function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const next = mounted && resolvedTheme === 'dark' ? 'light' : 'dark'
  const label = mounted ? `Switch to ${next} mode` : 'Switch colour mode'

  return (
    <Tooltip content={label}>
      <IconButton
        icon={
          <Glyph>
            {!mounted ? null : next === 'dark' ? (
              <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
            ) : (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </>
            )}
          </Glyph>
        }
        label={label}
        onClick={() => setTheme(next)}
        variant="secondary"
      />
    </Tooltip>
  )
}

export function GitHubButton({ href }: { href: string }) {
  return (
    <Tooltip content="GitHub repository">
      <IconButton
        asChild
        icon={
          <svg aria-hidden="true" fill="currentColor" height="16" viewBox="0 0 24 24" width="16">
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
          </svg>
        }
        label="GitHub repository"
        variant="secondary"
      >
        <a href={href} rel="noreferrer" target="_blank" />
      </IconButton>
    </Tooltip>
  )
}
