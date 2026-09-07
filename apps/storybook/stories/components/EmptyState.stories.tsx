import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, EmptyState } from 'haus-components'

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The block that stands in for content that is not there. Twenty-five ' +
          'references across three products and no component anywhere.\n\n' +
          'It belongs in a system because an empty state is mostly a *writing* ' +
          'decision, and the three situations below want three different sentences. ' +
          'vault renders all three through one component with no way to tell them ' +
          'apart, including load failures: which read as "there is nothing here" ' +
          'when the truth is "we could not look".',
      },
    },
  },
  argTypes: {
    headingLevel: { control: 'inline-radio', options: [2, 3, 4, 5, 6] },
    live: { control: 'inline-radio', options: ['off', 'polite'] },
  },
  args: {
    title: 'Add your first colour',
    description: 'Add by hex or extract from an image.',
    headingLevel: 3,
    live: 'off',
  },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const TheThreeSituations: Story = {
  name: 'The three situations',
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--haus-space-6)', maxWidth: 520 }}>
      <EmptyState
        {...args}
        title="Add your first colour"
        description="Add by hex or extract from an image."
        action={<Button size="sm">Add a colour</Button>}
      />
      <EmptyState
        {...args}
        title="No colours match this filter"
        description="Try a wider search, or clear the filter."
        action={undefined}
      />
      <EmptyState
        {...args}
        title="Couldn’t open your library"
        description="The file is there but could not be read."
        live="polite"
        action={undefined}
      />
    </div>
  ),
}

export const TitleOnly: Story = {
  name: 'Title only',
  args: { title: 'No results', description: undefined },
}

export const WithIcon: Story = {
  name: 'With an icon',
  parameters: {
    docs: {
      description: {
        story:
          'The `icon` slot sits above the title as the visual anchor for the block. ' +
          'A slot is invisible until something is put in it, so it gets a story of ' +
          'its own. haus ships no icon set, so the glyph is the consumer’s: this is ' +
          'a plain inline SVG using `currentColor`, which the `.icon` rule colours.',
      },
    },
  },
  args: {
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-3.5-3.5a2 2 0 0 0-2.8 0L4 21" />
      </svg>
    ),
    title: 'Add your first colour',
    description: 'Add by hex or extract from an image.',
    action: <Button size="sm">Add a colour</Button>,
  },
}
