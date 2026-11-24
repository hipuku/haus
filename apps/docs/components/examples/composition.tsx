'use client'

import { Badge, Button, Callout, Checkbox, Input } from 'haus-components'
import styles from './composition.module.css'

/*
 * The composition examples, as live components.
 *
 * These were inline-styled JSX inside a Storybook MDX page, which is why they
 * broke the first time anyone looked at them in dark: every colour was written
 * into a `style` attribute, so none of them followed the mode. Here they are
 * the published components reading their own roles, and the only thing this
 * file decides is the arrangement.
 */
export function SignInForm() {
  return (
    <form className={styles.form} onSubmit={event => event.preventDefault()}>
      <Callout tone="error">That email and password do not match.</Callout>
      <Input label="Email" placeholder="you@example.com" />
      <Input hint="At least 8 characters." label="Password" type="password" />
      <Checkbox label="Keep me signed in" />
      <Button tone="neutral" type="submit">
        Sign in
      </Button>
    </form>
  )
}

export function ToneRow() {
  return (
    <div className={styles.row}>
      <Badge tone="neutral">neutral</Badge>
      <Badge tone="info">info</Badge>
      <Badge tone="success">success</Badge>
      <Badge tone="warning">warning</Badge>
      <Badge tone="error">error</Badge>
    </div>
  )
}
