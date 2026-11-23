// The public API: what the converter uses, plus detectFormat. Everything
// else in src is internal to the readers and writers.
export { convert, read, write, type Conversion, type ReadOutcome } from './convert.js'
export { detectFormat } from './detect.js'
export { MAX_INPUT_BYTES, type InputDocument } from './document.js'
export { indexTokens, resolveValue, type Index, type Resolution } from './resolve.js'
export { propertyName } from './tailwind.js'
export * from './types.js'
export {
  colourToCss,
  cubicBezierToCss,
  dimensionToCss,
  durationToCss,
  isColorValue,
  isCubicBezier,
  isDimensionValue,
  isDurationValue,
} from './values.js'
