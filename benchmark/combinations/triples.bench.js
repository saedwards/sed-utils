/**
 * Triples, reduced to one number.
 */
import { combinationsForEach, obliteratorCombinations, Combination, G, naiveCombinations } from "./shared.js";
import { range, scenario } from "../harness.js";

for(const n of [50, 200]) {
	const array = range(n);

	let expected = 0;
	for(let i = 0; i < n; i++) for(let j = i + 1; j < n; j++) for(let k = j + 1; k < n; k++) {
		expected += array[i] + array[j] * array[k];
	}

	const implementations = {
		"@sedware/utils combinationsForEach": () => {
			let sum = 0;
			combinationsForEach(array, (a, b, c) => { sum += a + b * c; }, { size: 3 });
			return sum;
		},
		"obliterator combinations": () => {
			let sum = 0;
			for(const c of obliteratorCombinations(array, 3)) sum += c[0] + c[1] * c[2];
			return sum;
		},
		"js-combinatorics Combination": () => {
			let sum = 0;
			for(const c of new Combination(array, 3)) sum += c[0] + c[1] * c[2];
			return sum;
		},
		"generatorics combination": () => {
			let sum = 0;
			for(const c of G.combination(array, 3)) sum += c[0] + c[1] * c[2];
			return sum;
		},
		"baseline: nested for loops": () => {
			let sum = 0;
			for(let i = 0; i < n; i++) for(let j = i + 1; j < n; j++) for(let k = j + 1; k < n; k++) {
				sum += array[i] + array[j] * array[k];
			}
			return sum;
		},
	};

	// ~1.3M combinations at n=200: the naive version's memory use dominates, so it only runs at n=50.
	if(n <= 50) {
		implementations["naive recursive"] = () => {
			let sum = 0;
			for(const c of naiveCombinations(array, 3)) sum += c[0] + c[1] * c[2];
			return sum;
		};
	}

	scenario(`triples: sum of a+b*c, n=${n}`, implementations, expected);
}
