'use client'

import { useRef, useState } from 'react'
import { Button, Menu, MenuItem } from 'haus-components'
import { CopyGlyph, Glyph, useCopied } from './copy'

/*
 * The actions under a docs page's title, from haus's own Button and Menu
 * rather than Fumadocs' page-action controls.
 *
 * Copy Markdown copies the page's served markdown, the same text the llms
 * routes give an agent. Open lists the two places the page itself lives: its
 * source on GitHub and its markdown.
 */
const CHEVRON = 'm6 9 6 6 6-6'

export function PageActions({ markdownUrl, githubUrl }: { markdownUrl: string; githubUrl: string }) {
  const { copied, copy } = useCopied()
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)

  return (
    <>
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
      <Button
        onClick={async () => {
          const text = await fetch(markdownUrl).then(response => response.text())
          await copy(text)
        }}
        variant="secondary"
      >
        <CopyGlyph copied={copied} />
        Copy Markdown
      </Button>
    </>
  )
}
