'use client'

import { Button } from 'haus-components'
import { CopyGlyph, useCopied } from './copy'

/*
 * The prompt for working on this component with an agent.
 *
 * A "copy the page as markdown" button hands over the prose. That is useful,
 * and it is not the thing that goes wrong: an agent handed a component page
 * writes a hex code into a stylesheet, or re-implements the label a control
 * already renders. So the prompt carries the rules the component rests on as
 * well as the page, and it carries the install command only when the registry
 * actually serves the component, for the same reason the install block does.
 */
export function CopyPrompt({ prompt }: { prompt: string }) {
  const { copied, copy } = useCopied()

  return (
    <Button onClick={() => void copy(prompt)} variant="secondary">
      <CopyGlyph copied={copied} />
      Copy prompt
    </Button>
  )
}
