'use client'

import {
  colourToCss,
  convert,
  cubicBezierToCss,
  dimensionToCss,
  durationToCss,
  FORMAT_LABEL,
  ReadError,
  type FormatId,
  type LossEntry,
  type LossReason,
  type Token,
  type TokenValue,
} from '@hipuku/dtcg'
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock'
import { Badge, Button, Callout, Input, Select, Tabs, Textarea } from 'haus-components'
import { useMemo, useRef, useState } from 'react'
import styles from './tool.module.css'

export interface Example {
  id: string
  label: string
  files: { name: string; text: string }[]
  target: FormatId
}

type InputFile = { name: string; text: string }

const FORMATS = Object.keys(FORMAT_LABEL) as FormatId[]

/*
 * What each loss means, and whether it lost something or only translated it.
 * A converted unit or a resolved alias changes how a value is written and
 * keeps what it means; a dropped mode or an unrepresentable value does not
 * arrive at all. The report sorts by that difference.
 */
const REASON: Record<LossReason, { label: string; lost: boolean; meaning: string }> = {
  'dropped-type': { label: 'Dropped type', lost: true, meaning: 'The target has no type for this token.' },
  'dropped-mode': {
    label: 'Dropped mode',
    lost: true,
    meaning: 'The target holds one value, so other modes are gone.',
  },
  'dropped-composite': {
    label: 'Dropped composite',
    lost: true,
    meaning: 'The target cannot hold this composite at all.',
  },
  'unrepresentable-value': { label: 'Unrepresentable', lost: true, meaning: 'The target cannot express this value.' },
  'dropped-metadata': {
    label: 'Dropped metadata',
    lost: true,
    meaning: 'A description or extension had nowhere to go.',
  },
  'split-composite': { label: 'Split composite', lost: false, meaning: 'A composite arrives as its separate parts.' },
  'resolved-alias': { label: 'Resolved alias', lost: false, meaning: 'A reference became its value.' },
  'converted-colour': { label: 'Converted colour', lost: false, meaning: 'Written in another colour space.' },
  'converted-unit': { label: 'Converted unit', lost: false, meaning: 'Written in another unit.' },
  renamed: { label: 'Renamed', lost: false, meaning: 'The name changed to fit the target.' },
  'lenient-read': { label: 'Read leniently', lost: false, meaning: 'Input outside the spec was accepted as written.' },
}

/** A value as a person would write it: a reference as {path}, a literal by its type. */
function show(token: Token, value: TokenValue | undefined): string {
  if (!value) return ''
  if (value.kind === 'reference') return `{${value.ref.join('.')}}`
  if (value.kind === 'raw') return value.text
  const literal = value.value as never
  switch (token.type) {
    case 'color':
      return colourToCss(literal) ?? JSON.stringify(literal)
    case 'dimension':
      return dimensionToCss(literal)
    case 'duration':
      return durationToCss(literal)
    case 'cubicBezier':
      return cubicBezierToCss(literal)
    default:
      return typeof literal === 'object' ? JSON.stringify(literal) : String(literal)
  }
}

const language = (name: string) => (name.endsWith('.css') ? 'css' : 'json')

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
  const link = Object.assign(document.createElement('a'), { href: url, download: name })
  link.click()
  URL.revokeObjectURL(url)
}

/*
 * The converter as a workspace. Input on the left, as one tab per file, so a
 * Figma export of one file per mode is read as it is; the result on the right,
 * as the files written, the token model the engine read, and the report of
 * what did not survive. Everything runs in the browser through @hipuku/dtcg.
 */
export function Converter({ examples }: { examples: Example[] }) {
  const [exampleId, setExampleId] = useState(examples[0].id)
  const [files, setFiles] = useState<InputFile[]>(examples[0].files)
  const [active, setActive] = useState(examples[0].files[0].name)
  const [target, setTarget] = useState<FormatId>(examples[0].target)
  const [remBase, setRemBase] = useState('16')
  const [selector, setSelector] = useState<'data-theme' | 'class' | 'media'>('data-theme')
  const [view, setView] = useState('files')
  const upload = useRef<HTMLInputElement>(null)

  const choose = (id: string) => {
    const example = examples.find(e => e.id === id)
    if (!example) return
    setExampleId(id)
    setFiles(example.files)
    setActive(example.files[0].name)
    setTarget(example.target)
  }

  const outcome = useMemo(() => {
    const base = Number(remBase)
    if (!Number.isFinite(base) || base <= 0) return { error: 'The rem base must be a positive number.' }
    try {
      return { result: convert(files, target, { remBase: base, tailwindModeSelector: selector }) }
    } catch (error) {
      if (error instanceof ReadError) return { error: error.message }
      return { error: `The converter could not process this input: ${(error as Error).message}` }
    }
  }, [files, target, remBase, selector])

  const result = outcome.result
  const lost = result?.allLosses.filter(loss => REASON[loss.reason].lost) ?? []
  const translated = result?.allLosses.filter(loss => !REASON[loss.reason].lost) ?? []
  const current = files.find(f => f.name === active) ?? files[0]

  const grouped = (losses: LossEntry[]) => {
    const map = new Map<LossReason, LossEntry[]>()
    for (const loss of losses) map.set(loss.reason, [...(map.get(loss.reason) ?? []), loss])
    return [...map.entries()]
  }

  return (
    <div className={`not-prose ${styles.stack}`}>
      <div className={styles.controls}>
        <Select
          label="Start from an example"
          onChange={choose}
          options={examples.map(e => ({ label: e.label, value: e.id }))}
          value={exampleId}
        />
        <Select
          label="Convert to"
          onChange={value => setTarget(value as FormatId)}
          options={FORMATS.map(format => ({ label: FORMAT_LABEL[format], value: format }))}
          value={target}
        />
        <Input inputMode="decimal" label="Rem base, px" onChange={e => setRemBase(e.target.value)} value={remBase} />
        {target === 'tailwind' && (
          <Select
            label="Tailwind modes by"
            onChange={value => setSelector(value as typeof selector)}
            options={[
              { label: 'data-theme attribute', value: 'data-theme' },
              { label: 'Class', value: 'class' },
              { label: 'Media query', value: 'media' },
            ]}
            value={selector}
          />
        )}
      </div>

      <div className={styles.workspace}>
        <section aria-label="Input" className={styles.stack}>
          <div className={styles.paneHead}>
            <span className={styles.factLabel}>Input</span>
            {result && <Badge tone="info">Read as {FORMAT_LABEL[result.format]}</Badge>}
            <Button onClick={() => upload.current?.click()} size="sm" variant="secondary">
              Upload files
            </Button>
            <input
              accept=".json,.css"
              className={styles.hidden}
              multiple
              onChange={async event => {
                const chosen = [...(event.target.files ?? [])]
                if (!chosen.length) return
                const read = await Promise.all(chosen.map(async f => ({ name: f.name, text: await f.text() })))
                setFiles(read)
                setActive(read[0].name)
                event.target.value = ''
              }}
              ref={upload}
              type="file"
            />
          </div>
          <Tabs
            appearance="segmented"
            aria-label="Input files"
            items={files.map(f => ({ label: f.name, value: f.name }))}
            onValueChange={setActive}
            size="sm"
            value={current.name}
          >
            <Textarea
              error={outcome.error}
              label={current.name}
              onChange={event =>
                setFiles(all => all.map(f => (f.name === current.name ? { ...f, text: event.target.value } : f)))
              }
              rows={18}
              spellCheck={false}
              value={current.text}
            />
          </Tabs>
        </section>

        <section aria-label="Result" className={styles.stack}>
          <span className={styles.factLabel}>Result</span>
          {result && (
            <Tabs
              aria-label="Result"
              items={[
                { label: `Files (${result.files.length})`, value: 'files' },
                { label: `Tokens (${result.set.tokens.length})`, value: 'tokens' },
                { label: `Report (${result.allLosses.length})`, value: 'report' },
              ]}
              onValueChange={setView}
              size="sm"
              value={view}
            >
              {view === 'files' && (
                <div className={styles.stack}>
                  {result.files.map(file => (
                    <div className={styles.output} key={file.name}>
                      <div className={styles.paneHead}>
                        <span className={styles.outputName}>{file.name}</span>
                        <Button onClick={() => download(file.name, file.text)} size="sm" variant="ghost">
                          Download
                        </Button>
                      </div>
                      <DynamicCodeBlock code={file.text} lang={language(file.name)} />
                    </div>
                  ))}
                </div>
              )}

              {view === 'tokens' && (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Token</th>
                        <th>Type</th>
                        {result.set.modes.map(mode => (
                          <th key={mode}>{mode}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.set.tokens.map(token => (
                        <tr key={token.path.join('.')}>
                          <td>
                            <code>{token.path.join('.')}</code>
                          </td>
                          <td>{token.type ?? 'none'}</td>
                          {result.set.modes.map(mode => (
                            <td key={mode}>
                              <code>{show(token, token.values[mode])}</code>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {view === 'report' && (
                <div className={styles.stack} role="status">
                  {result.allLosses.length === 0 && <Callout tone="success">Nothing was lost or translated.</Callout>}
                  {[
                    { title: 'Lost', tone: 'warning' as const, losses: lost },
                    { title: 'Translated', tone: 'info' as const, losses: translated },
                  ]
                    .filter(group => group.losses.length)
                    .map(group => (
                      <div className={styles.stack} key={group.title}>
                        <span className={styles.factLabel}>
                          {group.title}, {group.losses.length}
                        </span>
                        {grouped(group.losses).map(([reason, entries]) => (
                          <div className={styles.reason} key={reason}>
                            <div className={styles.paneHead}>
                              <Badge tone={group.tone}>
                                {REASON[reason].label} · {entries.length}
                              </Badge>
                              <span className={styles.factNote}>{REASON[reason].meaning}</span>
                            </div>
                            <ul className={styles.losses}>
                              {entries.map((loss, i) => (
                                <li key={i}>
                                  <code>{loss.token}</code>
                                  {loss.mode ? ` (${loss.mode})` : ''}: {loss.detail}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              )}
            </Tabs>
          )}
        </section>
      </div>
    </div>
  )
}
