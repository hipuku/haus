import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { ConfirmDialog, type ConfirmDialogProps } from './ConfirmDialog'

const base: ConfirmDialogProps = {
  open: true,
  title: 'Delete workspace',
  description: 'Every decision in it goes too. This cannot be undone.',
  confirmLabel: 'Delete workspace',
  tone: 'error',
  onConfirm: () => {},
  onCancel: () => {},
}

describe('ConfirmDialog', () => {
  it('is an alertdialog named by its title and described by its description', () => {
    render(<ConfirmDialog {...base} />)
    const dialog = screen.getByRole('alertdialog', { name: 'Delete workspace' })
    expect(dialog).toHaveAccessibleDescription('Every decision in it goes too. This cannot be undone.')
  })

  it('starts on Cancel, so Enter does the safe thing', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(<ConfirmDialog {...base} onConfirm={onConfirm} onCancel={onCancel} />)
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('confirms from the confirm button', async () => {
    const onConfirm = vi.fn()
    render(<ConfirmDialog {...base} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: 'Delete workspace' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('cancels on Escape, but not while the action is pending', async () => {
    const onCancel = vi.fn()
    const { rerender } = render(<ConfirmDialog {...base} onCancel={onCancel} pending />)
    await userEvent.keyboard('{Escape}')
    expect(onCancel).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    rerender(<ConfirmDialog {...base} onCancel={onCancel} />)
    await userEvent.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('in the alert kind, offers one button and starts on it', () => {
    render(<ConfirmDialog {...base} kind="alert" title="Export finished" confirmLabel="Done" />)
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Done' })).toHaveFocus()
  })

  it('has no axe violations', async () => {
    const { baseElement } = render(<ConfirmDialog {...base} />)
    expect((await axe(baseElement)).violations).toEqual([])
  })
})
