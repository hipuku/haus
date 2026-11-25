'use client'

import { useRef, useState } from 'react'
import { Button, Menu, MenuItem } from 'haus-components'

/*
 * The actions under a docs page's title, from haus's own Button and Menu
 * rather than Fumadocs' page-action controls.
 *
 * Copy Markdown copies the page's served markdown, the same text the llms
 * routes give an agent. Open lists the two places the page itself lives: its
 * source on GitHub and its markdown.
 */
/* An icon beside a Button's label, by composition: Button lays its children
   out in a row with its own gap, so the glyph needs only a size, icon-sm. */
const Glyph = ({ d }: { d: string }) => (
  <svg
    aria-hidden="true"
    className="haus-button-glyph"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d={d} />
  </svg>
)
export const COPY =
  'M9 9h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2zM5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1'
const CHEVRON = 'm6 9 6 6 6-6'
export { Glyph }

export function PageActions({ markdownUrl, githubUrl }: { markdownUrl: string; githubUrl: string }) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)

  return (
    <>
      <Button
        onClick={async () => {
          const text = await fetch(markdownUrl).then(response => response.text())
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }}
        variant="secondary"
      >
        <Glyph d={COPY} />
        {copied ? 'Copied' : 'Copy Markdown'}
      </Button>
      <span className="haus-page-actions-open">
        <Button
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen(o => !o)}
          ref={trigger}
          variant="secondary"
        >
          Open
          <Glyph d={CHEVRON} />
        </Button>
        <Menu aria-label="Open this page" onClose={() => setOpen(false)} open={open} triggerRef={trigger}>
          <MenuItem onSelect={() => window.open(githubUrl, '_blank', 'noreferrer')}>Source on GitHub</MenuItem>
          <MenuItem onSelect={() => window.open(markdownUrl, '_blank', 'noreferrer')}>As Markdown</MenuItem>
        </Menu>
      </span>
    </>
  )
}
