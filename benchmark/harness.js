/**
 * Generic benchmark helpers shared by every util: inputs, result checks and
 * scenario registration. Nothing here knows about a specific util; each
 * util's folder has its own shared.js for competitors and adapters.
 */
import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { bench, do_not_optimize, group, summary } from "mitata";

/**
 * Exact version of each library, pinned in this folder's package.json and
 * printed in the output header.
 */
export const versions = JSON.parse(readFileSync(new URL("package.json", import.meta.url), "utf8")).dependencies;

/**
 * [0, 1, 2, ... n - 1]. Built once per scenario, outside the timed function.
 */
export const range = n => Array.from({ length: n }, (_, i) => i);

/**
 * Abort the run if a timed function doesn't return the expected value.
 */
export const assertResult = (name, fn, expected) => {
	const actual = fn();
	if(!isDeepStrictEqual(actual, expected)) {
		throw Error(`Correctness gate failed: ${name} returned ${JSON.stringify(actual)?.slice(0, 200)}`);
	}
};

/**
 * Register one comparison: every implementation is checked against
 * 'expected' first, then timed in a mitata group with a summary relative
 * to @sedware/utils.
 * Each function must return its result so it can't be optimised away.
 */
export const scenario = (title, implementations, expected) => {
	for(const [name, fn] of Object.entries(implementations)) {
		assertResult(`${title} / ${name}`, fn, expected);
	}
	group(title, () => {
		summary(() => {
			for(const [name, fn] of Object.entries(implementations)) {
				const trial = bench(name, () => do_not_optimize(fn()));
				// Compare everything against @sedware/utils rather than the fastest.
				if(name.startsWith("@sedware/utils")) trial.baseline(true);
			}
		});
	});
};
