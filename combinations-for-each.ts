import { defaultSize, combinationsIteration } from "./combinations/combinations-iteration.ts";
import type { Combination, CombinationsOptions } from "./combinations/combinations-iteration.ts";

/**
 * combinationsForEach
 *
 * Call 'method' with every unique combination, in the same order as
 * combinationsMap, without storing the results. Returns undefined.
 * Use this when results are not needed, to avoid the memory cost of keeping them.
 */
export const combinationsForEach = <T, S extends number = 2>(
	array: ArrayLike<T>,
	method: (...items: Combination<T, S>) => unknown,
	options: CombinationsOptions<S> = {},
): void => {
	/**
	 * Invalid sizes are rejected by the types above and by combinationsIteration at
	 * runtime, so inside the walk the size is just a number.
	 */
	const { size = defaultSize } = options as CombinationsOptions<number>;
	combinationsIteration(array, method as (...items: T[]) => unknown, size, "forEach");
};
