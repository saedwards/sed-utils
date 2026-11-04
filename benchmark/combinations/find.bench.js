/**
 * Find one pair, matched early, midway or never. Libraries that build every
 * combination before searching can't benefit from an early match.
 */
import { combinationsFind, obliteratorCombinations, obliteratorFind, Combination, G, naiveCombinations } from "./shared.js";
import { range, scenario } from "../harness.js";

const n = 1000;
const array = range(n);

const cases = [
	["first pair", [0, 1]],
	["middle pair", [146, 147]], // roughly half way through the 499,500 pairs
	["no match", [-1, -1]],
];

for(const [label, [x, y]] of cases) {
	const isMatch = (a, b) => a === x && b === y;
	const expected = x < 0 ? undefined : [x, y];

	scenario(`find: ${label}, n=${n}`, {
		"@sedware/utils combinationsFind": () => {
			const found = combinationsFind(array, isMatch);
			return found && [...found];
		},
		"obliterator find + combinations": () => {
			const found = obliteratorFind(obliteratorCombinations(array, 2), c => isMatch(c[0], c[1]));
			return found && [...found];
		},
		"js-combinatorics Combination": () => {
			for(const c of new Combination(array, 2)) if(isMatch(c[0], c[1])) return c;
			return undefined;
		},
		"generatorics combination": () => {
			for(const c of G.combination(array, 2)) if(isMatch(c[0], c[1])) return [...c];
			return undefined;
		},
		"naive recursive": () => naiveCombinations(array, 2).find(c => isMatch(c[0], c[1])),
		"baseline: nested for loops": () => {
			for(let i = 0; i < n; i++) for(let j = i + 1; j < n; j++) {
				if(isMatch(array[i], array[j])) return [array[i], array[j]];
			}
			return undefined;
		},
	}, expected);
}
