import { defaultSize, combinationsIteration } from "./combinations/combinations-iteration.ts";
import type { Combination, CombinationsOptions } from "./combinations/combinations-iteration.ts";

/**
 * combinationsFind
 *
 * Call 'predicate' with each unique combination, in the same order as
 * combinationsMap, and stop at the first one it returns a truthy value for.
 *
 * @returns A new array holding the first matching combination, or undefined
 * if nothing matched.
 */
export const combinationsFind = <T, S extends number = 2>(
	array: ArrayLike<T>,
	predicate: (...items: Combination<T, S>) => unknown,
	options: CombinationsOptions<S> = {},
): Combination<T, S> | undefined => {
	/**
	 * Invalid sizes are rejected by the types above and by combinationsIteration at
	 * runtime, so inside the walk the size is just a number.
	 */
	const { size = defaultSize } = options as CombinationsOptions<number>;
	return combinationsIteration(array, predicate as (...items: T[]) => unknown, size, "find") as
		Combination<T, S> | undefined;
};
