/* Exports the haus Figma file's variables and components for the parity check.

   Runs inside Figma, against the Plugin API: as the code of a development
   plugin, or through the Figma MCP server's use_figma tool. The Plugin API is
   the only way to read variables on a Pro plan. It reads and changes nothing.

   Variables are read in each collection's default mode, which for
   haus/semantics is the haus brand, and every alias is followed to its final
   value, because code is compared resolved too (see normalise.mjs).

   Its return value is saved as figma/snapshot/haus.json with
   `pnpm run figma:check --save <file>`. `pnpm run figma:check --plugin-code`
   prints the code to paste. The function takes `figma` as an argument so this
   module stays importable. */

export async function exportFile(figma) {
  const byId = {}
  for (const v of await figma.variables.getLocalVariablesAsync()) byId[v.id] = v
  const collections = await figma.variables.getLocalVariableCollectionsAsync()
  const defaultMode = {}
  for (const c of collections) defaultMode[c.id] = c.defaultModeId

  const finalValue = async (v, depth = 0) => {
    const raw = v.valuesByMode[defaultMode[v.variableCollectionId]] ?? Object.values(v.valuesByMode)[0]
    if (raw && typeof raw === 'object' && raw.type === 'VARIABLE_ALIAS') {
      const target = byId[raw.id] ?? (await figma.variables.getVariableByIdAsync(raw.id))
      return target && depth < 12 ? finalValue(target, depth + 1) : `unresolved ${raw.id}`
    }
    if (raw && typeof raw === 'object' && 'r' in raw) {
      const hex = [raw.r, raw.g, raw.b]
        .map(x =>
          Math.round(x * 255)
            .toString(16)
            .padStart(2, '0'),
        )
        .join('')
      const alpha =
        raw.a !== undefined && raw.a < 1
          ? Math.round(raw.a * 255)
              .toString(16)
              .padStart(2, '0')
          : ''
      return { hex: `#${hex}${alpha}` }
    }
    return raw
  }

  const variables = []
  for (const collection of collections) {
    for (const id of collection.variableIds) {
      const v = byId[id]
      if (!v) continue
      variables.push({
        collection: collection.name,
        name: v.name,
        type: v.resolvedType,
        codeSyntax: v.codeSyntax?.WEB ? { WEB: v.codeSyntax.WEB } : undefined,
        value: await finalValue(v),
      })
    }
  }

  const components = []
  for (const page of figma.root.children) {
    await page.loadAsync()
    for (const node of page.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] })) {
      // A variant inside a set has no definitions of its own, and reading them
      // throws; the set carries them, so variants are left out.
      if (node.parent?.type === 'COMPONENT_SET') continue
      components.push({
        name: node.name,
        page: page.name,
        type: node.type,
        inSet: false,
        props: Object.entries(node.componentPropertyDefinitions ?? {}).map(([name, d]) => ({
          name,
          type: d.type,
          options: d.variantOptions ?? [],
        })),
      })
    }
  }

  return { variables, components }
}

export const pluginCode = () => `${exportFile.toString()}\nreturn await exportFile(figma)\n`
