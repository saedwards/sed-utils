import { describe, expect, jest, test } from "@jest/globals";
import { combinationsFind } from "./combinations-find.ts";

describe("combinationsFind", () => {
	test("returns the first matching combination", () => {
		expect(combinationsFind([1, 2, 3, 4], (a, b) => a + b === 5)).toEqual([1, 4]);
	});

	test("returns undefined when nothing matches", () => {
		expect(combinationsFind([1, 2, 3], () => false)).toBeUndefined();
	});

	test("stops calling the predicate after the first match", () => {
		const predicate = jest.fn((a, b) => a === 1 && b === 3);
		combinationsFind([1, 2, 3, 4], predicate);
		expect(predicate.mock.calls).toEqual([[1, 2], [1, 3]]);
	});

	test("checks every combination when nothing matches", () => {
		const predicate = jest.fn(() => false);
		combinationsFind([1, 2, 3, 4], predicate);
		expect(predicate).toHaveBeenCalledTimes(6);
	});

	test("uses the 'size' option", () => {
		expect(combinationsFind([1, 2, 3, 4], (a, b, c) => a + b + c === 9, { size: 3 }))
			.toEqual([2, 3, 4]);
	});

	test.each([[1], ["yes"], [{}]])("treats %p as a match", value => {
		expect(combinationsFind([1, 2], () => value)).toEqual([1, 2]);
	});

	test.each([[0], [""], [null], [undefined]])("does not treat %p as a match", value => {
		expect(combinationsFind([1, 2], () => value)).toBeUndefined();
	});

	test("returns a new array on each call", () => {
		const first = combinationsFind([1, 2], () => true);
		const second = combinationsFind([1, 2], () => true);

		first?.push(0);

		expect(second).toEqual([1, 2]);
	});

	test("returns undefined when size is larger than the array", () => {
		const predicate = jest.fn();
		expect(combinationsFind([1], predicate)).toBeUndefined();
		expect(predicate).not.toHaveBeenCalled();
	});

	test("rejects an invalid size", () => {
		// @ts-expect-error a fractional size is also rejected by the types
		expect(() => combinationsFind([1, 2], () => true, { size: 0.5 }))
			.toThrow("'size' must be a whole number");
	});
});
