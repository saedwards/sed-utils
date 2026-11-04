/**
 * size = n/2: the largest number of combinations for a given n, with long
 * combinations. Per-combination copies cost the most here.
 * Every implementation reads every item of every combination.
 */
import { combinationsForEach, obliteratorCombinations, Combination, G, naiveCombinations } from "./shared.js";
import { range, scenario } from "../harness.js";

const n = 20;
const size = 10; // 184,756 combinations
const array = range(n);

const sumAll = items => {
	let total = 0;
	for(let i = 0; i < items.length; i++) total += items[i];
	return total;
};

let expected = 0;
for(const c of naiveCombinations(array, size)) expected += sumAll(c);

scenario(`size=${size} of n=${n}: sum of every item`, {
	// The idiomatic way to take a runtime size is rest parameters, which costs one array per call.
	"@sedware/utils combinationsForEach": () => {
		let sum = 0;
		combinationsForEach(array, (...items) => { sum += sumAll(items); }, { size });
		return sum;
	},
	"obliterator combinations": () => {
		let sum = 0;
		for(const c of obliteratorCombinations(array, size)) sum += sumAll(c);
		return sum;
	},
	"js-combinatorics Combination": () => {
		let sum = 0;
		for(const c of new Combination(array, size)) sum += sumAll(c);
		return sum;
	},
	"generatorics combination": () => {
		let sum = 0;
		for(const c of G.combination(array, size)) sum += sumAll(c);
		return sum;
	},
	"naive recursive": () => {
		let sum = 0;
		for(const c of naiveCombinations(array, size)) sum += sumAll(c);
		return sum;
	},
}, expected);
