import { describe, expect, jest, test } from "@jest/globals";
import { combinationsForEach } from "./combinations-for-each.ts";
import { combinationsMap } from "./combinations-map.ts";

describe("combinationsForEach", () => {
	test("calls the method with each unique pair by default", () => {
		const method = jest.fn();
		combinationsForEach([1, 2, 3], method);
		expect(method.mock.calls).toEqual([[1, 2], [1, 3], [2, 3]]);
	});

	test("uses the 'size' option", () => {
		const method = jest.fn();
		combinationsForEach([1, 2, 3], method, { size: 3 });
		expect(method.mock.calls).toEqual([[1, 2, 3]]);
	});

	test("returns undefined", () => {
		expect(combinationsForEach([1, 2, 3], () => "ignored")).toBeUndefined();
	});

	test("does not stop when the method returns a truthy value", () => {
		const method = jest.fn(() => true);
		combinationsForEach([1, 2, 3], method);
		expect(method).toHaveBeenCalledTimes(3);
	});

	test("visits combinations in the same order as combinationsMap", () => {
		const array = [1, 2, 3, 4, 5];
		const options = { size: 3 } as const;
		const visited: number[][] = [];

		combinationsForEach(array, (...items) => {
			visited.push(items);
		}, options);

		expect(visited).toEqual(combinationsMap(array, (...items) => items, options));
	});

	test("does not call the method when size is larger than the array", () => {
		const method = jest.fn();
		combinationsForEach([1], method);
		expect(method).not.toHaveBeenCalled();
	});

	test("rejects an invalid size", () => {
		// @ts-expect-error a negative size is also rejected by the types
		expect(() => combinationsForEach([1, 2], () => {}, { size: -1 }))
			.toThrow("'size' must be a positive number");
	});
});
