/**
 * Combinations helpers: competitor imports, adapters and the
 * same-combinations check used by gate.js.
 */
import { isDeepStrictEqual } from "node:util";
import { combinationsForEach, combinationsMap, combinationsFind } from "../../dist/index.js";
import obliteratorCombinations from "obliterator/combinations.js";
import obliteratorFind from "obliterator/find.js";
import { Combination } from "js-combinatorics";
import G from "generatorics";

/**
 * The naive approach people copy from Stack Overflow: recursion with
 * flatMap, materialising every combination as a new array.
 */
export const naiveCombinations = (array, size) => {
	if(size === 0) {
		return [[]];
	}
	return array.flatMap((item, i) =>
		naiveCombinations(array.slice(i + 1), size - 1).map(rest => [item, ...rest]));
};

/**
 * Every library normalised to "call visit(items) for each combination", where
 * 'items' is an array that may be reused between calls. Only used by the
 * correctness gate. The timed code calls each library idiomatically instead.
 */
export const adapters = {
	"@sedware/utils": (array, size, visit) =>
		combinationsForEach(array, (...items) => visit(items), { size }),
	"obliterator": (array, size, visit) => {
		for(const items of obliteratorCombinations(array, size)) visit(items);
	},
	"js-combinatorics": (array, size, visit) => {
		for(const items of new Combination(array, size)) visit(items);
	},
	"generatorics": (array, size, visit) => {
		for(const items of G.combination(array, size)) visit(items);
	},
	"naive recursive": (array, size, visit) => {
		for(const items of naiveCombinations(array, size)) visit(items);
	},
};

/**
 * Collect every combination an adapter visits, copying reused arrays.
 */
const collect = (adapter, array, size) => {
	const out = [];
	adapter(array, size, items => out.push([...items]));
	return out;
};

/**
 * Abort the whole run if any implementation produces a different list of
 * combinations, in a different order, from @sedware/utils. A benchmark of
 * a wrong answer proves nothing.
 */
export const assertSameCombinations = (array, size, names = Object.keys(adapters)) => {
	const expected = collect(adapters["@sedware/utils"], array, size);
	for(const name of names) {
		const actual = collect(adapters[name], array, size);
		if(!isDeepStrictEqual(actual, expected)) {
			throw Error(`Correctness gate failed: ${name} with n=${array.length}, size=${size}`);
		}
	}
};

export {
	combinationsForEach,
	combinationsMap,
	combinationsFind,
	obliteratorCombinations,
	obliteratorFind,
	Combination,
	G,
};
