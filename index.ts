/**
 * Public entry point for @sedware/utils. Every utility is re-exported from here.
 * Folders hold private implementation details and are not exported directly.
 */

// Combinations
export type { Combination, CombinationsOptions } from "./combinations/combinations-iteration.ts";
export { combinationsMap } from "./combinations-map.ts";
export { combinationsForEach } from "./combinations-for-each.ts";
export { combinationsFind } from "./combinations-find.ts";
