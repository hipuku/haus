/**
 * Stands in for a submit button while it loads.
 *
 * A loading Button or IconButton renders as `type="button"` so it keeps focus
 * (a button that becomes disabled while focused drops focus to the document).
 * That leaves its form without a submit button, and a form with one text field
 * and no submit button submits when Enter is pressed in the field: implicit
 * submission, in the HTML standard. A natively disabled submit button in the
 * loading button's place blocks it, because it becomes the form's default
 * button and a disabled default button submits nothing, which is what the
 * natively disabled loading button used to do.
 *
 * It is hidden, so it takes no space and nothing can reach it, and it carries
 * no handler, so a Server Component can still render the button (decision 0024).
 * Both components call this one, so the two cannot drift apart.
 */
export function SubmitStandIn({ form }: { form?: string }) {
  return <button type="submit" disabled hidden form={form} style={{ display: 'none' }} />
}
