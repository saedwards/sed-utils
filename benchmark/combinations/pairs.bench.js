/**
 * Pairs, reduced to one number. Pure iteration overhead: nothing is
 * allocated for the result, so any difference is the cost of the walk.
 */
import { combinationsForEach, obliteratorCombinations, Combination, G, naiveCombinations } from "./shared.js";
import { range, scenario } from "../harness.js";

for(const n of [10, 100, 1000]) {
	const array = range(n);

	let expected = 0;
	for(let i = 0; i < n; i++) for(let j = i + 1; j < n; j++) expected += array[i] * array[j];

	scenario(`pairs: sum of a*b, n=${n}`, {
		"@sedware/utils combinationsForEach": () => {
			let sum = 0;
			combinationsForEach(array, (a, b) => { sum += a * b; });
			return sum;
		},
		"obliterator combinations": () => {
			let sum = 0;
			for(const c of obliteratorCombinations(array, 2)) sum += c[0] * c[1];
			return sum;
		},
		"js-combinatorics Combination": () => {
			let sum = 0;
			for(const c of new Combination(array, 2)) sum += c[0] * c[1];
			return sum;
		},
		"generatorics combination": () => {
			let sum = 0;
			for(const c of G.combination(array, 2)) sum += c[0] * c[1];
			return sum;
		},
		"naive recursive": () => {
			let sum = 0;
			for(const c of naiveCombinations(array, 2)) sum += c[0] * c[1];
			return sum;
		},
		"baseline: nested for loops": () => {
			let sum = 0;
			for(let i = 0; i < n; i++) for(let j = i + 1; j < n; j++) sum += array[i] * array[j];
			return sum;
		},
	}, expected);
}
