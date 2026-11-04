import { defaultSize, combinationsIteration } from "./combinations/combinations-iteration.ts";
import type { Combination, CombinationsOptions } from "./combinations/combinations-iteration.ts";

/**
 * combinationsMap
 *
 * Call 'method' with every unique combination and return its results, in order.
 */
export const combinationsMap = <T, R, S extends number = 2>(
	array: ArrayLike<T>,
	method: (...items: Combination<T, S>) => R,
	options: CombinationsOptions<S> = {},
): R[] => {
	/**
	 * Invalid sizes are rejected by the types above and by combinationsIteration at
	 * runtime, so inside the walk the size is just a number.
	 */
	const {

		/**
		 * The amount of items to compare in the method within one iteration
		 * NOTE: This is the Exponent of iteration before filtering is applied.
		 */
		size = defaultSize,
	} = options as CombinationsOptions<number>;
	return combinationsIteration(array, method as (...items: T[]) => R, size, "map") as R[];
};
