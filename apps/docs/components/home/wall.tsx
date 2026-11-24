'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Avatar, Badge, Button, Input, Select, Toggle } from 'haus-components'
import styles from './wall.module.css'

/*
 * The published components, in their real states, on the landing page. Live
 * rather than a screenshot: a reader can tab through them, see the focus ring
 * the system actually draws, and switch the page to dark and watch every one
 * follow.
 *
 * Each one is a specimen with its name under it, rather than a card with a
 * caption over it. The component is what the reader is here to see, so it gets
 * the panel and the room; the name is a label for what they are already
 * looking at.
 *
 * The name is the link and the specimen is not. These are working components:
 * a link wrapped around a Select would swallow the click that opens it, and
 * the one thing this page is claiming is that they work.
 */
export function Wall() {
  const [space, setSpace] = useState('oklch')

  return (
    <div className={styles.wall}>
      <figure className={styles.item}>
        <div className={styles.panel}>
          <div className={styles.row}>
            <Badge tone="success">Shipped</Badge>
            <Badge tone="warning">In review</Badge>
            <Badge appearance="solid" tone="error">
              Blocked
            </Badge>
          </div>
        </div>
        <figcaption className={styles.caption}>
          <h2 className={styles.name}>
            <Link href="/docs/components/badge">Badge</Link>
          </h2>
          <p className={styles.description}>A state, in the tone the system gives that state.</p>
        </figcaption>
      </figure>

      <figure className={styles.item}>
        <div className={styles.panel}>
          <div className={styles.row}>
            <Button variant="primary">Save</Button>
            <Button variant="secondary">Cancel</Button>
            <Button variant="ghost">More</Button>
          </div>
        </div>
        <figcaption className={styles.caption}>
          <h2 className={styles.name}>
            <Link href="/docs/components/button">Button</Link>
          </h2>
          <p className={styles.description}>Three variants, one of them the action the page is for.</p>
        </figcaption>
      </figure>

      <figure className={styles.item}>
        <div className={styles.panel}>
          <div className={styles.column}>
            <Input defaultValue="hello@hipuku.dev" label="Email" />
          </div>
        </div>
        <figcaption className={styles.caption}>
          <h2 className={styles.name}>
            <Link href="/docs/components/input">Input</Link>
          </h2>
          <p className={styles.description}>Label, field and message as one unit.</p>
        </figcaption>
      </figure>

      <figure className={styles.item}>
        <div className={styles.panel}>
          <div className={styles.column}>
            <Select
              label="Colour space"
              onChange={setSpace}
              options={[
                { label: 'OKLCH', value: 'oklch' },
                { label: 'sRGB', value: 'srgb' },
                { label: 'Display P3', value: 'p3' },
              ]}
              value={space}
            />
          </div>
        </div>
        <figcaption className={styles.caption}>
          <h2 className={styles.name}>
            <Link href="/docs/components/select">Select</Link>
          </h2>
          <p className={styles.description}>A menu that opens where there is room for it.</p>
        </figcaption>
      </figure>

      <figure className={styles.item}>
        <div className={styles.panel}>
          <div className={styles.column}>
            <Toggle defaultChecked description="Follows the system setting" label="Reduced motion" />
          </div>
        </div>
        <figcaption className={styles.caption}>
          <h2 className={styles.name}>
            <Link href="/docs/components/toggle">Toggle</Link>
          </h2>
          <p className={styles.description}>A setting that takes effect as it is switched.</p>
        </figcaption>
      </figure>

      <figure className={styles.item}>
        <div className={styles.panel}>
          <div className={styles.row}>
            <Avatar name="Ada Lovelace" status="online" />
            <Avatar name="Grace Hopper" />
            <Avatar name="Alan Turing" size="sm" />
          </div>
        </div>
        <figcaption className={styles.caption}>
          <h2 className={styles.name}>
            <Link href="/docs/components/avatar">Avatar</Link>
          </h2>
          <p className={styles.description}>Initials when there is no image, and a status that reads without colour.</p>
        </figcaption>
      </figure>
    </div>
  )
}
