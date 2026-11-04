import { describe, expect, jest, test } from "@jest/globals";
import { defaultSize, combinationsIteration } from "./combinations-iteration.ts";

/**
 * Every combination the walk visits, collected by "map" mode.
 */
const collect = <T>(array: ArrayLike<T>, size: number): T[][] =>
	combinationsIteration(array, (...items) => items, size, "map") as T[][];

describe("defaultSize", () => {
	test("is pairs", () => {
		expect(defaultSize).toBe(2);
	});
});

describe("combinationsIteration", () => {
	describe("combinations", () => {
		test("visits pairs in a predictable order", () => {
			expect(collect([1, 2, 3, 4], 2)).toEqual([
				[1, 2], [1, 3], [1, 4],
				[2, 3], [2, 4],
				[3, 4],
			]);
		});

		test("visits triples in a predictable order", () => {
			expect(collect([1, 2, 3, 4], 3)).toEqual([
				[1, 2, 3], [1, 2, 4],
				[1, 3, 4],
				[2, 3, 4],
			]);
		});

		test("visits each item alone when size is 1", () => {
			expect(collect([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
		});

		test("visits the whole array once when size equals its length", () => {
			expect(collect([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
		});

		test.each([
			[5, 2, 10],
			[6, 3, 20],
			[7, 4, 35],
			[10, 5, 252],
		])("visits %i items in groups of %i exactly %i times", (length, size, expected) => {
			const array = Array.from({ length }, (_, i) => i);
			const visited = collect(array, size);

			expect(visited).toHaveLength(expected);
			expect(new Set(visited.map(String)).size).toBe(expected);
		});

		test("treats equal values at different positions as separate items", () => {
			expect(collect([1, 1, 1], 2)).toEqual([[1, 1], [1, 1], [1, 1]]);
		});

		test("does not change the input array", () => {
			const array = [1, 2, 3, 4];
			collect(array, 2);
			expect(array).toEqual([1, 2, 3, 4]);
		});

		test("visits holes in a sparse array as undefined", () => {
			// eslint-disable-next-line no-sparse-arrays
			expect(collect([1, , 3], 2)).toEqual([
				[1, undefined], [1, 3],
				[undefined, 3],
			]);
		});

		test("does not visit items added during the walk", () => {
			const array = [1, 2, 3];
			const visited: number[][] = [];
			combinationsIteration(array, (...items) => {
				visited.push(items);
				array.push(array.length + 1);
			}, 2, "forEach");
			expect(visited).toEqual([[1, 2], [1, 3], [2, 3]]);
		});

		test("reads each item when the walk moves to it", () => {
			const array = [1, 2, 3, 4];
			const visited: number[][] = [];
			combinationsIteration(array, (...items) => {
				if(visited.length === 0) {
					// 1 is already held for the pairs that start with it, 4 is not read yet
					array[0] = 10;
					array[3] = 40;
				}
				visited.push(items);
			}, 2, "forEach");
			expect(visited).toEqual([[1, 2], [1, 3], [1, 40], [2, 3], [2, 40], [3, 40]]);
		});

		test("handles a size too deep to recurse", () => {
			const method = jest.fn();
			combinationsIteration(Array(20001).fill(0), method, 20000, "forEach");
			expect(method).toHaveBeenCalledTimes(20001);
		});
	});

	describe("arguments", () => {
		test.each([1, 2, 3, 4, 5])("passes each item as a separate argument for size %i", size => {
			const array = [1, 2, 3, 4, 5, 6];
			const method = jest.fn();
			combinationsIteration(array, method, size, "forEach");
			expect(method.mock.calls).toEqual(collect(array, size));
			expect(method.mock.calls.every(args => args.length === size)).toBe(true);
		});
	});

	describe("nothing to visit", () => {
		test.each([
			["size is 0", [1, 2, 3], 0],
			["size is larger than the array", [1, 2], 3],
			["the array is empty", [], 1],
		])("does not call the method when %s", (_, array, size) => {
			const method = jest.fn();
			expect(combinationsIteration(array, method, size, "forEach")).toBeUndefined();
			expect(combinationsIteration(array, method, size, "map")).toEqual([]);
			expect(combinationsIteration(array, method, size, "find")).toBeUndefined();
			expect(method).not.toHaveBeenCalled();
		});
	});

	describe("forEach mode", () => {
		test("visits everything and returns undefined, whatever the method returns", () => {
			const method = jest.fn(() => true);
			expect(combinationsIteration([1, 2, 3], method, 2, "forEach")).toBeUndefined();
			expect(method).toHaveBeenCalledTimes(3);
		});
	});

	describe("map mode", () => {
		test("returns every result in order, whether truthy or falsy", () => {
			const results = [0, "a", null];
			let call = 0;
			expect(combinationsIteration([1, 2, 3], () => results[call++], 2, "map")).toEqual(results);
		});
	});

	describe("find mode", () => {
		test("stops as soon as the method returns a truthy value", () => {
			const method = jest.fn((a: number, b: number) => a === 1 && b === 3);
			expect(combinationsIteration([1, 2, 3, 4], method, 2, "find")).toEqual([1, 3]);
			expect(method).toHaveBeenCalledTimes(2);
		});

		test("stops every level of a deeper walk", () => {
			const method = jest.fn(() => true);
			expect(combinationsIteration([1, 2, 3, 4, 5], method, 3, "find")).toEqual([1, 2, 3]);
			expect(method).toHaveBeenCalledTimes(1);
		});

		test("continues while the method returns falsy values", () => {
			const method = jest.fn(() => 0);
			expect(combinationsIteration([1, 2, 3], method, 2, "find")).toBeUndefined();
			expect(method).toHaveBeenCalledTimes(3);
		});

		test.each([1, 2, 3, 4])("returns a new array, not the input, for size %i", size => {
			const array = [1, 2, 3, 4];
			const found = combinationsIteration(array, () => true, size, "find");
			expect(found).toEqual(array.slice(0, size));
			expect(found).not.toBe(array);
		});
	});

	describe("validation", () => {
		test.each([[1.5], [NaN], [Infinity]])("rejects %p as not a whole number", size => {
			expect(() => combinationsIteration([1, 2, 3], () => {}, size, "forEach"))
				.toThrow("'size' must be a whole number");
		});

		test("rejects a negative size", () => {
			expect(() => combinationsIteration([1, 2, 3], () => {}, -1, "forEach"))
				.toThrow("'size' must be a positive number");
		});

		test.each([
			["a Set", new Set([1, 2])],
			["an object with no length", {}],
			["an object with an invalid length", { length: NaN }],
			["null", null],
			["undefined", undefined],
		])("rejects %s instead of walking forever", (_, array) => {
			// Deliberately not array-like, to check the runtime guard
			expect(() => combinationsIteration(array as ArrayLike<unknown>, () => {}, 2, "forEach"))
				.toThrow("'array' must be an array");
		});

		test("accepts a typed array", () => {
			expect(collect(new Uint8Array([1, 2, 3]), 2)).toEqual([[1, 2], [1, 3], [2, 3]]);
		});

		test("accepts an array-like object", () => {
			expect(collect({ length: 3, 0: "a", 1: "b", 2: "c" }, 2)).toEqual([["a", "b"], ["a", "c"], ["b", "c"]]);
		});

		test("validates size even when the array is empty", () => {
			expect(() => combinationsIteration([], () => {}, -1, "forEach"))
				.toThrow("'size' must be a positive number");
		});
	});
});
