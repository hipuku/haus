import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import {
  CopyChip, ColLabel,
  pageWrap, pageTitleStyle, pageDescStyle,
  tokenValueStyle,
  TableGrid, TH, TD, TableDivider,
  SectionHead,
} from './_shared'

/* ─── Local constants ────────────────────────────────────────────────────── */

const SEM_COLS = 'auto auto 1fr'

const subHead: React.CSSProperties = {
  fontSize: '0.625rem',
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--color-ink-secondary)',
  margin: 'var(--space-5) 0 0',
}

/* ─── Building blocks ────────────────────────────────────────────────────── */

function ColorRamp({ steps, accentStep }: { steps: [string, string][]; accentStep?: number }) {
  return (
    <div style={{ marginTop: 'var(--space-3)' }}>
      <div style={{
        display: 'flex',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--color-border-default)',
      }}>
        {steps.map(([name, value]) => (
          <div key={name} style={{ flex: 1, height: 56, background: value }} />
        ))}
      </div>
      <div style={{ display: 'flex', marginTop: 'var(--space-1)' }}>
        {steps.map(([name]) => {
          const step = name.split('-').pop() ?? ''
          const isAnchor = accentStep !== undefined && parseInt(step) === accentStep
          return (
            <div key={name} style={{ flex: 1, textAlign: 'center' }}>
              <span style={{
                display: 'inline-block',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.5rem',
                fontWeight: isAnchor ? 700 : 400,
                color: isAnchor ? 'var(--color-ink-primary)' : 'var(--color-ink-secondary)',
                ...(isAnchor ? {
                  background: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border-strong)',
                  borderRadius: '2px',
                  padding: '0 2px',
                } : {}),
              }}>
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CompactRef({ steps }: { steps: [string, string][] }) {
  return (
    <div style={{ marginTop: 'var(--space-2)' }}>
      {steps.map(([name, value]) => (
        <div key={name} style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-2)',
          padding: 'var(--space-1) 0',
          borderBottom: '1px solid var(--color-border-default)',
          alignItems: 'center',
        }}>
          <CopyChip name={name} />
          <span style={tokenValueStyle}>{value}</span>
        </div>
      ))}
    </div>
  )
}

function SemRow({ token, resolvedTo }: { token: string; resolvedTo: string }) {
  const isOnSubtle  = token.endsWith('-on-subtle')
  const isOnDefault = token.endsWith('-on-default')

  let swatch: React.ReactNode
  if (isOnSubtle) {
    const base = token.replace('-on-subtle', '')
    swatch = (
      <div style={{
        width: 44, height: 36, borderRadius: 'var(--radius-md)',
        background: `var(--color-${base}-subtle)`,
        border: `1px solid var(--color-${base}-border)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--type-label-size)', fontWeight: 700, color: `var(--color-${token})`, lineHeight: 1 }}>Aa</span>
      </div>
    )
  } else if (isOnDefault) {
    const base = token.replace('-on-default', '')
    swatch = (
      <div style={{
        width: 44, height: 36, borderRadius: 'var(--radius-md)',
        background: `var(--color-${base}-default)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--type-label-size)', fontWeight: 700, color: `var(--color-${token})`, lineHeight: 1 }}>Aa</span>
      </div>
    )
  } else {
    swatch = (
      <div style={{
        width: 44, height: 36, borderRadius: 'var(--radius-md)',
        background: `var(--color-${token})`,
        border: '1px solid var(--color-border-default)',
      }} />
    )
  }

  return (
    <>
      <TD>{swatch}</TD>
      <TD><CopyChip name={`color-${token}`} /></TD>
      <TD><span style={tokenValueStyle}>{resolvedTo}</span></TD>
    </>
  )
}

/* ─── Primitive data ─────────────────────────────────────────────────────── */

const aronia: [string, string][] = [
  ['aronia-100', 'oklch(97% 0.012 300)'], ['aronia-200', 'oklch(92% 0.028 300)'],
  ['aronia-300', 'oklch(84% 0.058 300)'], ['aronia-400', 'oklch(72% 0.100 300)'],
  ['aronia-500', 'oklch(52% 0.138 300)'], ['aronia-600', 'oklch(43% 0.125 300)'],
  ['aronia-700', 'oklch(35% 0.105 300)'], ['aronia-800', 'oklch(26% 0.080 300)'],
  ['aronia-900', 'oklch(18% 0.052 300)'], ['aronia-950', 'oklch(12% 0.032 300)'],
]
const damson: [string, string][] = [
  ['damson-0',   'oklch(100% 0 0)'      ], ['damson-50',  'oklch(99% 0.003 290)'],
  ['damson-100', 'oklch(97% 0.006 290)' ], ['damson-200', 'oklch(93% 0.008 290)'],
  ['damson-300', 'oklch(86% 0.010 290)' ], ['damson-400', 'oklch(74% 0.010 290)'],
  ['damson-500', 'oklch(60% 0.008 290)' ], ['damson-600', 'oklch(48% 0.007 290)'],
  ['damson-700', 'oklch(37% 0.006 290)' ], ['damson-800', 'oklch(27% 0.005 290)'],
  ['damson-900', 'oklch(18% 0.003 290)' ], ['damson-950', 'oklch(11% 0.002 290)'],
]

const feedback: { heading: string; steps: [string, string][] }[] = [
  { heading: 'Elderberry · H=265° — info', steps: [
    ['elderberry-100', 'oklch(97% 0.020 265)'], ['elderberry-200', 'oklch(93% 0.040 265)'],
    ['elderberry-400', 'oklch(74% 0.160 265)'], ['elderberry-500', 'oklch(55% 0.200 265)'],
    ['elderberry-700', 'oklch(42% 0.160 265)'], ['elderberry-900', 'oklch(30% 0.120 265)'],
  ]},
  { heading: 'Greengage · H=148° — success', steps: [
    ['greengage-100', 'oklch(97% 0.030 148)'], ['greengage-200', 'oklch(93% 0.055 148)'],
    ['greengage-400', 'oklch(75% 0.150 148)'], ['greengage-500', 'oklch(58% 0.185 148)'],
    ['greengage-700', 'oklch(45% 0.150 148)'], ['greengage-900', 'oklch(33% 0.110 148)'],
  ]},
  { heading: 'Mango · H=65° — warning', steps: [
    ['mango-100', 'oklch(97% 0.025 65)'], ['mango-200', 'oklch(93% 0.045 65)'],
    ['mango-400', 'oklch(76% 0.145 65)'], ['mango-500', 'oklch(60% 0.175 65)'],
    ['mango-700', 'oklch(47% 0.142 65)'], ['mango-900', 'oklch(38% 0.110 65)'],
  ]},
  { heading: 'Cherry · H=27° — error', steps: [
    ['cherry-100', 'oklch(97% 0.030 27)'], ['cherry-200', 'oklch(93% 0.055 27)'],
    ['cherry-400', 'oklch(74% 0.160 27)'], ['cherry-500', 'oklch(58% 0.200 27)'],
    ['cherry-700', 'oklch(44% 0.168 27)'], ['cherry-900', 'oklch(33% 0.110 27)'],
  ]},
]

/* ─── Semantic data ──────────────────────────────────────────────────────── */

type SemGroup = { heading: string; tokens: { token: string; resolvedTo: string }[]; accent?: string }

const semanticGroups: SemGroup[] = [
  { heading: 'Surface', tokens: [
    { token: 'surface-default',  resolvedTo: 'damson-0'   },
    { token: 'surface-subtle',   resolvedTo: 'damson-100' },
    { token: 'surface-raised',   resolvedTo: 'damson-0'   },
    { token: 'surface-overlay',  resolvedTo: 'damson-50'  },
    { token: 'surface-sunken',   resolvedTo: 'damson-200' },
    { token: 'surface-inverse',  resolvedTo: 'damson-900' },
    { token: 'surface-disabled', resolvedTo: 'damson-100' },
  ]},
  { heading: 'Ink', tokens: [
    { token: 'ink-primary',    resolvedTo: 'damson-900'  },
    { token: 'ink-secondary',  resolvedTo: 'damson-700'  },
    { token: 'ink-tertiary',   resolvedTo: 'damson-500'  },
    { token: 'ink-disabled',   resolvedTo: 'damson-400'  },
    { token: 'ink-inverse',    resolvedTo: 'damson-0'    },
    { token: 'ink-link',       resolvedTo: 'aronia-500'  },
    { token: 'ink-on-aronia',  resolvedTo: 'damson-0'    },
  ]},
  { heading: 'Border', tokens: [
    { token: 'border-subtle',   resolvedTo: 'damson-100'        },
    { token: 'border-default',  resolvedTo: 'damson-200'        },
    { token: 'border-strong',   resolvedTo: 'damson-300'        },
    { token: 'border-focus',    resolvedTo: '→ primary-default' },
    { token: 'border-disabled', resolvedTo: 'damson-200'        },
  ]},
  { heading: 'Primary — Aronia', accent: 'var(--color-primary-default)', tokens: [
    { token: 'primary-default',   resolvedTo: 'aronia-500' },
    { token: 'primary-hover',     resolvedTo: 'aronia-600' },
    { token: 'primary-pressed',   resolvedTo: 'aronia-700' },
    { token: 'primary-subtle',    resolvedTo: 'aronia-100' },
    { token: 'primary-on-subtle', resolvedTo: 'aronia-700' },
    { token: 'primary-disabled',  resolvedTo: 'damson-200' },
  ]},
  { heading: 'Feedback — Info (Elderberry)', accent: 'var(--color-info-default)', tokens: [
    { token: 'info-subtle',     resolvedTo: 'elderberry-100' },
    { token: 'info-border',     resolvedTo: 'elderberry-200' },
    { token: 'info-default',    resolvedTo: 'elderberry-500' },
    { token: 'info-on-subtle',  resolvedTo: 'elderberry-700' },
    { token: 'info-on-default', resolvedTo: 'damson-0'       },
    { token: 'info-emphasis',   resolvedTo: 'elderberry-900' },
  ]},
  { heading: 'Feedback — Success (Greengage)', accent: 'var(--color-success-default)', tokens: [
    { token: 'success-subtle',     resolvedTo: 'greengage-100' },
    { token: 'success-border',     resolvedTo: 'greengage-200' },
    { token: 'success-default',    resolvedTo: 'greengage-500' },
    { token: 'success-on-subtle',  resolvedTo: 'greengage-700' },
    { token: 'success-on-default', resolvedTo: 'damson-900'    },
    { token: 'success-emphasis',   resolvedTo: 'greengage-900' },
  ]},
  { heading: 'Feedback — Warning (Mango)', accent: 'var(--color-warning-default)', tokens: [
    { token: 'warning-subtle',     resolvedTo: 'mango-100'  },
    { token: 'warning-border',     resolvedTo: 'mango-200'  },
    { token: 'warning-default',    resolvedTo: 'mango-500'  },
    { token: 'warning-on-subtle',  resolvedTo: 'mango-700'  },
    { token: 'warning-on-default', resolvedTo: 'damson-900' },
    { token: 'warning-emphasis',   resolvedTo: 'mango-900'  },
  ]},
  { heading: 'Feedback — Error (Cherry)', accent: 'var(--color-error-default)', tokens: [
    { token: 'error-subtle',     resolvedTo: 'cherry-100' },
    { token: 'error-border',     resolvedTo: 'cherry-200' },
    { token: 'error-default',    resolvedTo: 'cherry-500' },
    { token: 'error-on-subtle',  resolvedTo: 'cherry-700' },
    { token: 'error-on-default', resolvedTo: 'damson-0'   },
    { token: 'error-emphasis',   resolvedTo: 'cherry-900' },
  ]},
]

/* ─── Pages ──────────────────────────────────────────────────────────────── */

function PrimitivesPage() {
  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Primitives</h1>
      <p style={pageDescStyle}>
        OKLCH throughout — perceptually uniform, wide-gamut. Aronia runs 100–950 in ten even steps; the 500 anchor is the source value for each ramp. Feedback palettes use six targeted steps: 100 (bg), 200 (border), 400 (icon), 500 (default), 700 (on-subtle text), 900 (emphasis). Never reference primitives from a component — use the semantic layer.
      </p>

      <SectionHead accent="var(--color-primary-default)">Aronia · H=300° · dusty purple</SectionHead>
      <ColorRamp steps={aronia} accentStep={500} />
      <CompactRef steps={aronia} />

      <SectionHead>Damson · H=290° · cool neutral (same hue family as Aronia)</SectionHead>
      <ColorRamp steps={damson} />
      <CompactRef steps={damson} />

      <SectionHead>Feedback palettes — semantic roles map here</SectionHead>
      {feedback.map(({ heading, steps }) => (
        <React.Fragment key={heading}>
          <p style={subHead}>{heading}</p>
          <ColorRamp steps={steps} accentStep={500} />
          <CompactRef steps={steps} />
        </React.Fragment>
      ))}
    </div>
  )
}

function SemanticsPage() {
  return (
    <div style={pageWrap}>
      <h1 style={pageTitleStyle}>Semantics</h1>
      <p style={pageDescStyle}>
        Role-based aliases between primitives and components. Each token names an intent — <code style={{ fontFamily: 'var(--font-mono)' }}>surface-sunken</code> describes purpose, not a value. Swap a theme by pointing these tokens at different primitives; nothing in components changes. <strong>on-*</strong> tokens show "Aa" on their paired background — contrast is visible, not just implied. Click any token to copy.
      </p>

      {semanticGroups.map(({ heading, tokens, accent }) => (
        <React.Fragment key={heading}>
          <SectionHead accent={accent}>{heading}</SectionHead>
          <TableGrid columns={SEM_COLS}>
            <TH><ColLabel icon="fa-solid fa-palette">Swatch</ColLabel></TH>
            <TH><ColLabel icon="fa-solid fa-tag">Token</ColLabel></TH>
            <TH><ColLabel icon="fa-solid fa-arrow-right-long">Resolves to</ColLabel></TH>
            <TableDivider />
            {tokens.map(({ token, resolvedTo }) => (
              <SemRow key={token} token={token} resolvedTo={resolvedTo} />
            ))}
          </TableGrid>
        </React.Fragment>
      ))}
    </div>
  )
}

/* ─── Meta ───────────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Tokens/Colours',
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const Primitives: Story = { render: () => <PrimitivesPage /> }
export const Semantics:  Story = { render: () => <SemanticsPage /> }
