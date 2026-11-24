import React from 'react'
import { Button } from '../Button'
import { Modal } from '../Modal'
import styles from './ConfirmDialog.module.css'

/**
 * "Are you sure", as one component.
 *
 * vault's `ConfirmDialog` and core's `ConfirmAction` both built it on their
 * Modal (4.5 audit). What they agreed on is kept:
 *
 * · **Focus starts on Cancel** (vault). Enter then does the safe thing, so a
 *   stray keystroke as the dialog appears cannot delete anything.
 * · **The confirm button carries the tone** (core), so the dialog's primary
 *   action reads as the same decision as the button that opened it.
 * · **A pending state** (core): the confirm button shows it is working, and the
 *   dialog cannot be dismissed while it does, so a running action is not
 *   abandoned half way.
 * · **An alert kind** (vault): one button, nothing to cancel, for a dialog
 *   that reports rather than asks. It destroys nothing, so it has no danger
 *   button.
 *
 * It is an `alertdialog`, so a screen reader announces it as interrupting and
 * reads its description with it. A backdrop click never dismisses it: the
 * whole point is a deliberate answer.
 */
export interface ConfirmDialogProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title' | 'role' | 'onClick' | 'aria-label'
> {
  open: boolean
  title: string
  /** What will happen, read out with the title. */
  description: React.ReactNode
  /** Says what the action does: "Delete workspace", not "OK". */
  confirmLabel: string
  cancelLabel?: string
  /** `error` for an action that destroys something. */
  tone?: 'neutral' | 'error'
  /** `alert` reports and offers one button; `confirm` asks. */
  kind?: 'confirm' | 'alert'
  /** The action is running: the confirm button spins and the dialog stays. */
  pending?: boolean
  onConfirm: () => void
  /** Cancel, Escape, and the close button. Not called while `pending`. */
  onCancel: () => void
}

export const ConfirmDialog = React.forwardRef<HTMLDivElement, ConfirmDialogProps>(function ConfirmDialog(
  {
    open,
    title,
    description,
    confirmLabel,
    cancelLabel = 'Cancel',
    tone = 'neutral',
    kind = 'confirm',
    pending = false,
    onConfirm,
    onCancel,
    ...rest
  },
  ref,
) {
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  const confirmRef = React.useRef<HTMLButtonElement>(null)
  const descriptionId = React.useId()
  const dismiss = React.useCallback(() => {
    if (!pending) onCancel()
  }, [pending, onCancel])

  return (
    <Modal
      {...rest}
      ref={ref}
      open={open}
      onClose={dismiss}
      title={title}
      size="sm"
      role="alertdialog"
      aria-describedby={descriptionId}
      dismissOnBackdrop={false}
      initialFocus={kind === 'alert' ? confirmRef : cancelRef}
      footer={
        <div className={styles.actions}>
          {kind === 'confirm' && (
            <Button ref={cancelRef} variant="ghost" onClick={dismiss} disabled={pending}>
              {cancelLabel}
            </Button>
          )}
          <Button
            ref={confirmRef}
            variant="primary"
            tone={kind === 'alert' ? 'neutral' : tone}
            loading={pending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div id={descriptionId}>{description}</div>
    </Modal>
  )
})
