import { describe, expect, jest, test } from "@jest/globals";
import { combinationsMap } from "./combinations-map.ts";

describe("combinationsMap", () => {
	test("returns the method's result for each unique pair by default", () => {
		expect(combinationsMap([1, 2, 3], (a, b) => a + b)).toEqual([3, 4, 5]);
	});

	test("passes each combination as separate arguments", () => {
		const method = jest.fn();
		combinationsMap([1, 2, 3], method);
		expect(method.mock.calls).toEqual([[1, 2], [1, 3], [2, 3]]);
	});

	test("uses the 'size' option", () => {
		expect(combinationsMap([1, 2, 3, 4], (...items) => items, { size: 3 })).toEqual([
			[1, 2, 3], [1, 2, 4], [1, 3, 4], [2, 3, 4],
		]);
	});

	test("treats an empty options object as the default size", () => {
		expect(combinationsMap([1, 2], (...items) => items, {})).toEqual([[1, 2]]);
	});

	test("gives independent arrays to a method that keeps its arguments", () => {
		const result = combinationsMap([1, 2, 3], (...items) => items);
		expect(result).toEqual([[1, 2], [1, 3], [2, 3]]);
		expect(result[0]).not.toBe(result[1]);
	});

	test("passes objects through by reference", () => {
		const first = { id: 1 };
		const second = { id: 2 };
		const [[a, b]] = combinationsMap([first, second], (...items) => items);
		expect(a).toBe(first);
		expect(b).toBe(second);
	});

	test("keeps every result, whether truthy or falsy", () => {
		const results = [true, 0, "yes"];
		expect(combinationsMap([1, 2, 3], () => results.shift())).toEqual([true, 0, "yes"]);
	});

	test.each([
		["size is larger than the array", [1, 2], { size: 3 }],
		["size is 0", [1, 2], { size: 0 }],
		["the array is empty", [], undefined],
		["the array has too few items for the default size", [1], undefined],
	])("returns an empty array when %s", (_, array, options) => {
		const method = jest.fn();
		expect(combinationsMap(array, method, options)).toEqual([]);
		expect(method).not.toHaveBeenCalled();
	});

	test("rejects an invalid size", () => {
		// @ts-expect-error a fractional size is also rejected by the types
		expect(() => combinationsMap([1, 2], () => {}, { size: 1.5 }))
			.toThrow("'size' must be a whole number");
	});

	test("lets errors from the method propagate", () => {
		const method = () => {
			throw new Error("boom");
		};
		expect(() => combinationsMap([1, 2], method)).toThrow("boom");
	});
});
