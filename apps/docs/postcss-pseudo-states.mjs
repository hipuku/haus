/*
 * Gives each haus component rule that reads a pointer or focus pseudo-class a
 * twin that reads an attribute instead: `.button:hover` also matches
 * `.button[data-pseudo-hover]`, `:focus-visible` also matches
 * `[data-pseudo-focus-visible]`, and so on.
 *
 * The landing page's wall shows a component hovered, pressed or focused by
 * setting those attributes, so what it shows is the component's own rule, at
 * its own specificity, in its own cascade layer, rather than a second
 * stylesheet imitating it. A script cannot put an element into `:hover` or
 * `:focus-visible`, and focusing one for real would take focus from the
 * reader. This is the technique of Storybook's pseudo-states addon.
 *
 * Only haus-components' stylesheet is rewritten, and nothing outside the wall
 * sets the attributes.
 */
const PSEUDO = /:(focus-visible|focus-within|focus|hover|active)(?![\w-])/g

export default function pseudoStates() {
  return {
    postcssPlugin: 'haus-pseudo-states',
    Once(root) {
      const file = root.source?.input.file ?? ''
      if (!/haus-components|packages[\\/]components[\\/]dist/.test(file)) return
      root.walkRules(rule => {
        if (rule.parent?.type === 'atrule' && /keyframes/.test(rule.parent.name)) return
        const twins = rule.selectors
          .filter(selector => PSEUDO.test(selector))
          .map(selector => selector.replace(PSEUDO, (_, name) => `[data-pseudo-${name}]`))
        PSEUDO.lastIndex = 0
        if (twins.length) rule.selectors = [...rule.selectors, ...twins]
      })
    },
  }
}
pseudoStates.postcss = true
