export const defaultSize = 2;

/**
 * Shown by the compiler in place of a literal size that would throw at runtime.
 */
export type InvalidSizeError = "'size' must be a whole, non-negative number";

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

/**
 * Literal sizes that combinationsIteration would reject: negative, or with a fraction
 * (a small fraction like 1e-7 is written with a negative exponent).
 */
type IsInvalidSize<S extends number> =
	number extends S ? false
	: `${S}` extends `-${string}` | `${string}.${string}` | `${string}e-${string}` ? true
	: false;

/**
 * Literal sizes too large to build a tuple for: 100 or more. TypeScript stops
 * recursing at around 1000, so this keeps well clear of that limit, and no
 * callback takes that many separate arguments anyway.
 * A huge size like 1e21 is written with an exponent.
 */
type IsLargeSize<S extends number> =
	`${S}` extends `${Digit}${Digit}${Digit}${string}` | `${string}e${string}` ? true : false;

/**
 * The size option's type: the literal size itself, or InvalidSizeError when the
 * literal would throw at runtime, so it is reported where the size is written.
 */
export type ValidSize<S extends number> = IsInvalidSize<S> extends true ? InvalidSizeError : S;

/**
 * The items passed for one combination: a tuple when 'S' is a literal size,
 * otherwise an array, as a size only known at runtime can't be checked.
 * Sizes of 100 or more, and invalid sizes, are also plain arrays.
 */
export type Combination<T, S extends number> =
	number extends S ? T[]
	: IsInvalidSize<S> extends true ? T[]
	: IsLargeSize<S> extends true ? T[]
	: BuildCombination<T, S>;

type BuildCombination<T, S extends number, Items extends unknown[] = []> =
	Items["length"] extends S ? Items : BuildCombination<T, S, [...Items, T]>;

export interface CombinationsOptions<S extends number = 2> {
	/** The amount of items in each combination. Defaults to 2. */
	size?: ValidSize<S>;
}

/**
 * What the walk does with each result of 'method':
 * - "forEach" ignores it.
 * - "map" keeps it, and the walk returns every result in order.
 * - "find" stops at the first truthy one, and the walk returns a new array
 *   holding that combination.
 */
export type WalkMode = "forEach" | "map" | "find";

/**
 * Walk every unique combination, calling 'method' with its items as separate
 * arguments, and handle each result as 'mode' says.
 * Holes in a sparse array are visited as undefined.
 */
export const combinationsIteration = <T>(
	array: ArrayLike<T>,
	method: (...items: NoInfer<T>[]) => unknown,
	size: number,
	mode: WalkMode,
): unknown[] | T[] | undefined => {
	if(!Number.isInteger(size)) {
		throw Error("'size' must be a whole number");
	}

	if(size < 0) {
		throw Error("'size' must be a positive number");
	}

	/**
	 * The walk below only ends by comparing positions against the length, so
	 * anything without a usable length would never finish.
	 */
	if(!Number.isInteger(array?.length)) {
		throw TypeError("'array' must be an array");
	}

	/**
	 * Only "map" keeps results, and returns them even when there are none.
	 */
	const product: unknown[] | undefined = mode === "map" ? [] : undefined;

	if(size === 0 || size > array.length) {
		return product;
	}

	/**
	 * Fixed at the start, so items added during the walk are not visited.
	 */
	const length = array.length;
	const lastDepth = size - 1;

	/**
	 * The array position currently held at each depth, and the item there.
	 * Earlier items are read when their depth moves, the last on each step.
	 */
	const indices: number[] = [];
	const pointer: T[] = [];
	for(let depth = 0; depth < size; depth++) {
		indices.push(depth);
		pointer.push(array[depth]);
	}

	while(true) {
		/**
		 * Visit every remaining item at the last depth.
		 */
		for(let i = indices[lastDepth]; i < length; i++) {
			pointer[lastDepth] = array[i];

			/**
			 * Small sizes pass their items directly, as spreading the pointer
			 * into arguments costs more than the rest of a step.
			 */
			const result =
				size === 2 ? method(pointer[0], pointer[1])
				: size === 1 ? method(pointer[0])
				: size === 3 ? method(pointer[0], pointer[1], pointer[2])
				: method(...pointer);

			if(product) {
				product.push(result);
			} else if(mode === "find" && result) {
				return [...pointer];
			}
		}

		/**
		 * Find the deepest position that can still move forward. Each depth must
		 * leave enough items after it to fill the depths that follow.
		 */
		let depth = lastDepth - 1;
		while(depth >= 0 && indices[depth] === depth + length - size) {
			depth--;
		}

		if(depth < 0) {
			return product;
		}

		/**
		 * Move it forward, then restart every following depth directly after it.
		 */
		let index = indices[depth] + 1;
		while(depth < size) {
			indices[depth] = index;
			pointer[depth] = array[index];
			depth++;
			index++;
		}
	}
};
