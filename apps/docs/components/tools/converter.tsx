'use client'

import { convert, FORMAT_LABEL, ReadError, type FormatId } from '@hipuku/dtcg'
import { Callout, Select, Textarea } from 'haus-components'
import { useMemo, useState } from 'react'

const SAMPLE = `{
  "color": {
    "$type": "color",
    "brand": { "$value": { "colorSpace": "oklch", "components": [0.52, 0.138, 300] } },
    "link": { "$value": "{color.brand}" }
  },
  "space": {
    "$type": "dimension",
    "sm": { "$value": { "value": 0.5, "unit": "rem" } }
  },
  "motion": {
    "fast": { "$type": "duration", "$value": { "value": 120, "unit": "ms" } },
    "standard": { "$type": "cubicBezier", "$value": [0.4, 0, 0.2, 1] }
  }
}
`

const FORMATS = Object.keys(FORMAT_LABEL) as FormatId[]

/**
 * The tokenise converter as a docs page: paste tokens in any of the four
 * formats, pick a target, and read what the conversion wrote and what it lost.
 * Everything runs in the browser through @hipuku/dtcg; nothing is uploaded.
 */
export function Converter() {
  const [text, setText] = useState(SAMPLE)
  const [target, setTarget] = useState<FormatId>('figma')

  const outcome = useMemo(() => {
    try {
      return { result: convert([{ name: 'tokens.json', text }], target) }
    } catch (error) {
      if (error instanceof ReadError) return { error: error.message }
      throw error
    }
  }, [text, target])

  return (
    <div className="not-prose grid gap-4">
      <Textarea
        label="Tokens"
        hint="DTCG, a Figma variables export, Tokens Studio or a Tailwind v4 stylesheet. The format is detected."
        value={text}
        onChange={event => setText(event.target.value)}
        error={outcome.error}
        rows={14}
        spellCheck={false}
        style={{ fontFamily: 'var(--haus-font-mono)' }}
      />
      <Select
        label="Convert to"
        options={FORMATS.map(format => ({ value: format, label: FORMAT_LABEL[format] }))}
        value={target}
        onChange={value => setTarget(value as FormatId)}
      />
      {outcome.result && (
        <>
          <p>
            Read as {FORMAT_LABEL[outcome.result.format]}: {outcome.result.set.tokens.length}{' '}
            {outcome.result.set.tokens.length === 1 ? 'token' : 'tokens'}
            {outcome.result.set.modes.length > 1 ? `, ${outcome.result.set.modes.length} modes` : ''}.
          </p>
          {outcome.result.files.map(file => (
            <figure key={file.name} className="grid gap-1">
              <figcaption>{file.name}</figcaption>
              <pre className="overflow-x-auto rounded border p-3 text-sm">
                <code>{file.text}</code>
              </pre>
            </figure>
          ))}
          {outcome.result.allLosses.length === 0 ? (
            <Callout tone="success">Nothing was lost.</Callout>
          ) : (
            <Callout tone="warning">
              {outcome.result.allLosses.length} {outcome.result.allLosses.length === 1 ? 'loss' : 'losses'}
              <ul>
                {outcome.result.allLosses.map((loss, i) => (
                  <li key={i}>
                    <code>{loss.token}</code>
                    {loss.mode ? ` (${loss.mode})` : ''}, {loss.reason}: {loss.detail}
                  </li>
                ))}
              </ul>
            </Callout>
          )}
        </>
      )}
    </div>
  )
}
