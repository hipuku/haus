import React from 'react'
import styles from './Card.module.css'

export type CardVariant = 'default' | 'elevated' | 'outlined'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', padding = true, className, children, ...rest },
  ref,
) {
  const cls = [
    styles.card,
    styles[variant],
    padding ? styles.padded : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div ref={ref} className={cls} {...rest}>
      {children}
    </div>
  )
})
