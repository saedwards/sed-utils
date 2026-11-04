/**
 * A Float64Array input. obliterator only accepts plain arrays, so it pays for
 * an Array.from copy first, which is what a user would have to write.
 */
import { combinationsForEach, obliteratorCombinations, Combination, G } from "./shared.js";
import { scenario } from "../harness.js";

const n = 1000;
const array = Float64Array.from({ length: n }, (_, i) => i / 10);

let expected = 0;
for(let i = 0; i < n; i++) for(let j = i + 1; j < n; j++) expected += array[i] * array[j];

scenario(`Float64Array pairs: sum of a*b, n=${n}`, {
	"@sedware/utils combinationsForEach": () => {
		let sum = 0;
		combinationsForEach(array, (a, b) => { sum += a * b; });
		return sum;
	},
	"obliterator combinations (Array.from copy)": () => {
		let sum = 0;
		for(const c of obliteratorCombinations(Array.from(array), 2)) sum += c[0] * c[1];
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
	"baseline: nested for loops": () => {
		let sum = 0;
		for(let i = 0; i < n; i++) for(let j = i + 1; j < n; j++) sum += array[i] * array[j];
		return sum;
	},
}, expected);
