/**
 * Pairs, collected as new [a, b] arrays. Every implementation has to
 * allocate the output here, which narrows the gap between libraries that
 * reuse one array and libraries that allocate per combination.
 */
import { combinationsMap, obliteratorCombinations, Combination, G, naiveCombinations } from "./shared.js";
import { range, scenario } from "../harness.js";

for(const n of [100, 1000]) {
	const array = range(n);
	const expected = naiveCombinations(array, 2);

	scenario(`collect pairs as arrays, n=${n}`, {
		"@sedware/utils combinationsMap": () => combinationsMap(array, (a, b) => [a, b]),
		"obliterator combinations": () => Array.from(obliteratorCombinations(array, 2), c => [c[0], c[1]]),
		// Already yields a new array per combination, so no copy is needed.
		"js-combinatorics Combination": () => Array.from(new Combination(array, 2)),
		"generatorics combination": () => Array.from(G.combination(array, 2), c => [c[0], c[1]]),
		"naive recursive": () => naiveCombinations(array, 2),
		"baseline: nested for loops": () => {
			const out = [];
			for(let i = 0; i < n; i++) for(let j = i + 1; j < n; j++) out.push([array[i], array[j]]);
			return out;
		},
	}, expected);
}
