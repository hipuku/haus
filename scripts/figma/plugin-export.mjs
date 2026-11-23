/* Exports the haus Figma file's variables and components for the parity check.

   Runs inside Figma, against the Plugin API: as the code of a development
   plugin, or through the Figma MCP server's use_figma tool. The Plugin API is
   the only way to read variables on a Pro plan. It reads and changes nothing.

   Variables are read in each collection's default mode, which for
   haus/semantics is the haus brand, and every alias is followed to its final
   value, because code is compared resolved too (see normalise.mjs). A collection with a
   mode named `dark` (haus/theme) also has that mode's value exported, as `dark`.

   Its return value is saved as figma/snapshot/haus.json with
   `pnpm run figma:check --save <file>`. `pnpm run figma:check --plugin-code`
   prints the code to paste. The function takes `figma` as an argument so this
   module stays importable. */

export async function exportFile(figma) {
  // Taken before the first read, so an edit made while the export runs is newer
  // than the capture and the snapshot is reported stale rather than fresh.
  const capturedAt = new Date().toISOString()
  const byId = {}
  for (const v of await figma.variables.getLocalVariablesAsync()) byId[v.id] = v
  const collections = await figma.variables.getLocalVariableCollectionsAsync()
  const defaultMode = {}
  for (const c of collections) defaultMode[c.id] = c.defaultModeId

  const finalValue = async (v, depth = 0, mode = undefined) => {
    const raw = v.valuesByMode[mode ?? defaultMode[v.variableCollectionId]] ?? Object.values(v.valuesByMode)[0]
    if (raw && typeof raw === 'object' && raw.type === 'VARIABLE_ALIAS') {
      const target = byId[raw.id] ?? (await figma.variables.getVariableByIdAsync(raw.id))
      // A target in the same collection resolves in the mode being read, so a
      // dark value aliasing another dark-mode variable stays dark. A target in
      // another collection (a primitive) resolves in its own default mode.
      const sameCollection = target?.variableCollectionId === v.variableCollectionId
      return target && depth < 12
        ? finalValue(target, depth + 1, sameCollection ? mode : undefined)
        : `unresolved ${raw.id}`
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
    // A collection's dark mode, where it has one (haus/theme), is exported
    // beside the default so the dark colour map can be compared too.
    const dark = collection.modes.find(m => m.name === 'dark')
    for (const id of collection.variableIds) {
      const v = byId[id]
      if (!v) continue
      variables.push({
        collection: collection.name,
        name: v.name,
        type: v.resolvedType,
        codeSyntax: v.codeSyntax?.WEB ? { WEB: v.codeSyntax.WEB } : undefined,
        value: await finalValue(v),
        ...(dark ? { dark: await finalValue(v, 0, dark.modeId) } : {}),
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

  return { capturedAt, variables, components }
}

export const pluginCode = () => `${exportFile.toString()}\nreturn await exportFile(figma)\n`
