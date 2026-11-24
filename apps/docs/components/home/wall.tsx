'use client'

import { useState } from 'react'
import { Avatar, Badge, Button, Card, Input, Select, Toggle } from 'haus-components'
import styles from './wall.module.css'

/*
 * The published components, in their real states, on the landing page. Live
 * rather than a screenshot: a reader can tab through them, see the focus ring
 * the system actually draws, and switch the page to dark and watch every one
 * follow. That is the claim the site is making, so it should be the thing on
 * the page rather than a picture of it.
 */
export function Wall() {
  const [space, setSpace] = useState('oklch')

  return (
    <div className={styles.wall}>
      <Card className={styles.demo} variant="elevated">
        <span className={styles.label}>Badge</span>
        <div className={styles.row}>
          <Badge tone="success">Shipped</Badge>
          <Badge tone="warning">In review</Badge>
          <Badge appearance="solid" tone="error">
            Blocked
          </Badge>
        </div>
      </Card>

      <Card className={styles.demo} variant="elevated">
        <span className={styles.label}>Button</span>
        <div className={styles.row}>
          <Button variant="primary">Save</Button>
          <Button variant="secondary">Cancel</Button>
          <Button variant="ghost">More</Button>
        </div>
      </Card>

      <Card className={styles.demo} variant="elevated">
        <span className={styles.label}>Input</span>
        <div className={styles.column}>
          <Input defaultValue="hello@hipuku.dev" label="Email" />
        </div>
      </Card>

      <Card className={styles.demo} variant="elevated">
        <span className={styles.label}>Select</span>
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
      </Card>

      <Card className={styles.demo} variant="elevated">
        <span className={styles.label}>Toggle</span>
        <div className={styles.column}>
          <Toggle defaultChecked description="Follows the system setting" label="Reduced motion" />
        </div>
      </Card>

      <Card className={styles.demo} variant="elevated">
        <span className={styles.label}>Avatar</span>
        <div className={styles.row}>
          <Avatar name="Ada Lovelace" status="online" />
          <Avatar name="Grace Hopper" />
          <Avatar name="Alan Turing" size="sm" />
        </div>
      </Card>
    </div>
  )
}
