'use client'

import {
  colourToCss,
  convert,
  cubicBezierToCss,
  dimensionToCss,
  durationToCss,
  FORMAT_LABEL,
  LOSS_REASONS,
  ReadError,
  type FormatId,
  type LossReason,
  type Token,
  type TokenValue,
} from '@hipuku/dtcg'
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock'
import { Badge, Button, Callout, Input, Select, Tabs, Textarea } from 'haus-components'
import { useMemo, useRef, useState } from 'react'
import { Panel, Stage, ToolView } from './tool-view'
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

  /* The reasons this conversion actually hit, in the package's own order,
     each with how many tokens it touched. Three or four of eleven, usually. */
  const reasons = result
    ? LOSS_REASONS.map(reason => ({
        reason,
        count: result.allLosses.filter(loss => loss.reason === reason).length,
      })).filter(entry => entry.count > 0)
    : []

  /* What happened, in the order a reader asks it: what came in, what it was
     read as, what came out, and what did not survive. */
  const readings = result && [
    { label: 'Read as', value: FORMAT_LABEL[result.format] },
    { label: 'Tokens', value: String(result.set.tokens.length) },
    { label: 'Modes', value: result.set.modes.join(', ') || 'one' },
    { label: 'Files written', value: String(result.files.length) },
    { label: 'Lost', value: String(lost.length), tone: lost.length ? 'no' : 'yes' },
    { label: 'Translated', value: String(translated.length) },
  ]

  const field = (
    <Textarea
      error={outcome.error}
      label={current.name}
      onChange={event =>
        setFiles(all => all.map(f => (f.name === current.name ? { ...f, text: event.target.value } : f)))
      }
      rows={14}
      spellCheck={false}
      value={current.text}
    />
  )

  return (
    <ToolView>
      {/* The page is three things in order: what you have, what you want, and
          what you get. It was a control strip, then the answer, then the
          source it came from at the foot of the page, which is the journey
          backwards. */}
      <Stage name="The tokens you have" note="An example, your own files, or either one edited here." number={1}>
        <div className={styles.controls}>
          <Select
            label="Start from an example"
            onChange={choose}
            options={examples.map(e => ({ label: e.label, value: e.id }))}
            value={exampleId}
          />
          <div className={styles.controlAction}>
            <Button onClick={() => upload.current?.click()} variant="secondary">
              Upload your own
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
        </div>
        {files.length > 1 ? (
          <Tabs
            appearance="segmented"
            aria-label="Input files"
            items={files.map(f => ({ label: f.name, value: f.name }))}
            onValueChange={setActive}
            size="sm"
            value={current.name}
          >
            {field}
          </Tabs>
        ) : (
          field
        )}
      </Stage>

      <Stage name="What to write" note="The format to write, and how to write it." number={2}>
        <div className={styles.options}>
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
      </Stage>

      <Stage name="What you get" note="What was written, the model behind it, and what did not survive." number={3}>
        {outcome.error && <Callout tone="error">{outcome.error}</Callout>}

        {/* The answer, before any of the material it is drawn from. */}
        {result && readings && (
          <Panel label="What happened">
            <dl className={styles.coords}>
              {readings.map(reading => (
                <div key={reading.label}>
                  <dt>{reading.label}</dt>
                  <dd>
                    {reading.tone ? (
                      <span className={styles.verdict} data-pass={reading.tone}>
                        {reading.value}
                      </span>
                    ) : (
                      reading.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </Panel>
        )}

        {result && (
          <Tabs
            aria-label="Result"
            items={[
              { label: `Files (${result.files.length})`, value: 'files' },
              { label: `Tokens (${result.set.tokens.length})`, value: 'tokens' },
              { label: `Report (${result.allLosses.length})`, value: 'report' },
            ]}
            onValueChange={setView}
            value={view}
          >
            {view === 'files' && (
              <div className={styles.stack}>
                {result.files.map(file => (
                  <div className={styles.output} key={file.name}>
                    <span className={styles.outputName}>{file.name}</span>
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
                      <th scope="col">Token</th>
                      <th scope="col">Type</th>
                      {result.set.modes.map(mode => (
                        <th key={mode} scope="col">
                          {mode}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.set.tokens.map(token => (
                      <tr key={token.path.join('.')}>
                        <th scope="row">
                          <code className={styles.value}>{token.path.join('.')}</code>
                        </th>
                        <td>{token.type ?? 'none'}</td>
                        {result.set.modes.map(mode => (
                          <td key={mode}>
                            <code className={styles.value}>{show(token, token.values[mode])}</code>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* One flat table, lost first, under a legend of the reasons this
                conversion actually hit. */}
            {view === 'report' && (
              <div className={styles.stack} role="status">
                {result.allLosses.length === 0 ? (
                  <Callout tone="success">Nothing was lost or translated.</Callout>
                ) : (
                  <>
                    <ul className={styles.rows}>
                      {reasons.map(({ reason, count }) => (
                        <li key={reason}>
                          <Badge tone={REASON[reason].lost ? 'warning' : 'info'}>{REASON[reason].label}</Badge>
                          <span className={styles.rowName}>{REASON[reason].meaning}</span>
                          <span className={styles.rowValue}>
                            {count} {count === 1 ? 'token' : 'tokens'}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th scope="col">Token</th>
                            <th scope="col">Mode</th>
                            <th scope="col">What happened</th>
                            <th scope="col">Detail</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...lost, ...translated].map((loss, i) => (
                            <tr key={`${loss.reason}-${loss.token}-${loss.mode ?? ''}-${i}`}>
                              <th scope="row">
                                <code className={styles.value}>{loss.token}</code>
                              </th>
                              <td>{loss.mode ?? ''}</td>
                              <td>
                                <Badge tone={REASON[loss.reason].lost ? 'warning' : 'info'}>
                                  {REASON[loss.reason].label}
                                </Badge>
                              </td>
                              <td className={styles.detail}>{loss.detail}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </Tabs>
        )}
      </Stage>
    </ToolView>
  )
}
