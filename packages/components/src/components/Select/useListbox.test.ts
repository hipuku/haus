import { afterEach, describe, expect, it } from 'vitest'
import { scrollWithinList } from './useListbox'

/*
 * jsdom lays nothing out, so each box is given the size and the position it
 * would have: a 100px list scrolled to the top, holding rows 30px tall.
 */
function rect(top: number, height: number) {
  return { top, bottom: top + height, height, left: 0, right: 100, width: 100, x: 0, y: top, toJSON: () => ({}) }
}

function sized(el: HTMLElement, { scrollHeight, clientHeight }: { scrollHeight: number; clientHeight: number }) {
  Object.defineProperty(el, 'scrollHeight', { configurable: true, value: scrollHeight })
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: clientHeight })
}

function setup({ scrolls }: { scrolls: boolean }) {
  const page = document.createElement('div')
  page.style.overflowY = 'auto'
  sized(page, { scrollHeight: 2000, clientHeight: 600 })

  const list = document.createElement('div')
  list.style.overflowY = 'auto'
  sized(list, scrolls ? { scrollHeight: 300, clientHeight: 100 } : { scrollHeight: 90, clientHeight: 90 })
  list.getBoundingClientRect = () => rect(0, 100) as DOMRect

  // As Select renders it: the options in a listbox, the listbox in the panel.
  const listbox = document.createElement('ul')
  listbox.setAttribute('role', 'listbox')
  const option = document.createElement('li')
  listbox.append(option)
  list.append(listbox)
  page.append(list)
  document.body.append(page)
  return { page, list, option }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('scrollWithinList', () => {
  it('scrolls the list down by the least distance that shows a row below it', () => {
    const { list, option, page } = setup({ scrolls: true })
    option.getBoundingClientRect = () => rect(120, 30) as DOMRect

    scrollWithinList(option)

    expect(list.scrollTop).toBe(50)
    expect(page.scrollTop).toBe(0)
  })

  it('scrolls the list up to a row above it', () => {
    const { list, option } = setup({ scrolls: true })
    list.scrollTop = 80
    option.getBoundingClientRect = () => rect(-40, 30) as DOMRect

    scrollWithinList(option)

    expect(list.scrollTop).toBe(40)
  })

  it('leaves a row already in view where it is', () => {
    const { list, option } = setup({ scrolls: true })
    option.getBoundingClientRect = () => rect(30, 30) as DOMRect

    scrollWithinList(option)

    expect(list.scrollTop).toBe(0)
  })

  // The defect this replaces: scrollIntoView scrolled the page, and any
  // clipped container, to reach a row that was outside it. The page here
  // scrolls, so a search that did not stop at the panel would move it.
  it('scrolls nothing outside a list that does not scroll', () => {
    const { page, list, option } = setup({ scrolls: false })
    option.getBoundingClientRect = () => rect(700, 30) as DOMRect

    scrollWithinList(option)

    expect(list.scrollTop).toBe(0)
    expect(page.scrollTop).toBe(0)
  })
})
