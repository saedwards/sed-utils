/**
 * Correctness gate for combinations, imported by run.js before any
 * combinations scenario is timed: every library must produce the same
 * combinations, in the same order, over a spread of sizes.
 */
import { range } from "../harness.js";
import { adapters, assertSameCombinations } from "./shared.js";

for(const [n, size] of [[1, 1], [5, 1], [5, 2], [6, 3], [8, 4], [10, 2], [12, 6], [7, 7]]) {
	assertSameCombinations(range(n), size, Object.keys(adapters));
}
