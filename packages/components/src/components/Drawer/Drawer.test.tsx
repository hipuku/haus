import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { Drawer } from './Drawer'

describe('Drawer', () => {
  it('is a modal dialog named by its title, anchored to the end edge by default', () => {
    render(
      <Drawer open onClose={() => {}} title="Details">
        Body
      </Drawer>,
    )
    const dialog = screen.getByRole('dialog', { name: 'Details' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog.parentElement).toHaveAttribute('data-placement', 'end')
  })

  it('anchors to the start edge when asked', () => {
    render(
      <Drawer open onClose={() => {}} title="Filters" side="start">
        Body
      </Drawer>,
    )
    expect(screen.getByRole('dialog').parentElement).toHaveAttribute('data-placement', 'start')
  })

  it('closes on Escape, as a Modal does', async () => {
    const onClose = vi.fn()
    render(
      <Drawer open onClose={onClose} title="Details">
        <button>Inside</button>
      </Drawer>,
    )
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('has no axe violations', async () => {
    const { baseElement } = render(
      <Drawer open onClose={() => {}} title="Details">
        Body
      </Drawer>,
    )
    expect((await axe(baseElement)).violations).toEqual([])
  })
})
