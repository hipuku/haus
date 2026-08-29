export { toHex }                           from './toHex'

export { generateLightnessScale }          from './lightnessScale'
export type { LightnessScaleOptions }      from './lightnessScale'

export { wcagContrast, isLight, suggestTextColour } from './contrast'
export type { ContrastResult }             from './contrast'

export { clusterByPerceptualDistance }     from './cluster'
export type { ColourCluster }              from './cluster'

export { deltaE }                          from './deltaE'

export { nearestNamedColour, createNamedColourMatcher, basicColourNames } from './namedColour'
export type { NamedColourMatch, NamedColourEntry } from './namedColour'
