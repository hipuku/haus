import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('exposes itself as an image with an accessible name', () => {
    render(<Avatar name="Ada Lovelace" />)
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument()
  })

  it('falls back to a generic name when given nothing to go on', () => {
    render(<Avatar />)
    expect(screen.getByRole('img', { name: 'Avatar' })).toBeInTheDocument()
  })

  it('prefers an explicit alt over the derived name', () => {
    render(<Avatar name="Ada Lovelace" alt="Profile photo" />)
    expect(screen.getByRole('img', { name: 'Profile photo' })).toBeInTheDocument()
  })

  it('folds status into the accessible name, since the dot is decorative', () => {
    // The status indicator is aria-hidden, so if the name does not carry it the
    // information is invisible to assistive technology.
    render(<Avatar name="Ada" status="online" />)
    expect(screen.getByRole('img', { name: 'Ada, online' })).toBeInTheDocument()
  })

  it('shows initials when there is no image', () => {
    render(<Avatar name="Ada Lovelace" />)
    expect(screen.getByText('AL')).toBeInTheDocument()
  })

  it('renders the image with an empty alt when src is given', () => {
    // The wrapper already carries the accessible name; a second one on the img
    // makes screen readers announce the person twice.
    const { container } = render(<Avatar src="/ada.jpg" name="Ada" />)
    const img = container.querySelector('img')!
    expect(img).toHaveAttribute('src', '/ada.jpg')
    expect(img).toHaveAttribute('alt', '')
  })

  it('gives the same name the same colour every time', () => {
    // The palette is chosen by hashing the name. If it were random, a user's
    // avatar would change colour on every render.
    const first = render(<Avatar name="Ada Lovelace" />)
    const firstStyle = first.getByRole('img').getAttribute('style')
    first.unmount()

    const second = render(<Avatar name="Ada Lovelace" />)
    expect(second.getByRole('img').getAttribute('style')).toBe(firstStyle)
  })

  it('renders rather than throwing when the name is empty', () => {
    // initials('') split to [''], so [0][0] was undefined and .toUpperCase()
    // threw. An avatar for a user whose name had not loaded took the page down
    // instead of drawing an empty circle.
    expect(() => render(<Avatar name="" />)).not.toThrow()
    expect(() => render(<Avatar name="   " />)).not.toThrow()
  })

  it('applies the size class', () => {
    const { container } = render(<Avatar name="Ada" size="lg" />)
    expect(container.firstElementChild!.className).toContain('lg')
  })

  it('has no axe violations across sizes and states', async () => {
    const { container } = render(
      <>
        <Avatar name="Ada Lovelace" size="xs" />
        <Avatar name="Grace Hopper" size="lg" status="online" />
        <Avatar src="/x.jpg" alt="A photo of Ada" />
        <Avatar />
      </>,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})
