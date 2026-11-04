/**
 * Compile-time checks, run by `npm run typecheck`. This file is never executed.
 * A @ts-expect-error fails the check if the line below it stops being an error.
 */
import {
	combinationsFind,
	combinationsForEach,
	combinationsMap,
	type Combination,
	type CombinationsOptions,
} from "./index.ts";

type Equal<A, B> = (<X>() => X extends A ? 1 : 2) extends (<X>() => X extends B ? 1 : 2) ? true : false;
const expectType = <A, B>(_: Equal<A, B>) => {};

// Pairs are the default
const pairs = combinationsMap([1, 2, 3], (a, b) => {
	expectType<typeof a, number>(true);
	expectType<typeof b, number>(true);
	return `${a}${b}`;
});
expectType<typeof pairs, string[]>(true);

// A literal size gives a callback and result of exactly that length
const triples = combinationsMap(["a", "b", "c"], (...items) => items, { size: 3 });
expectType<typeof triples, [string, string, string][]>(true);

// A size only known at runtime falls back to a plain array
const runtimeSize: number = 3;
const dynamic = combinationsFind([1, 2, 3], (...items) => items.length > 0, { size: runtimeSize });
expectType<typeof dynamic, number[] | undefined>(true);

// find returns the combination, or undefined
const found = combinationsFind([1, 2, 3], (a, b) => a + b === 5);
expectType<typeof found, [number, number] | undefined>(true);

const foundFour = combinationsFind([1, 2, 3, 4], () => true, { size: 4 });
expectType<typeof foundFour, [number, number, number, number] | undefined>(true);

// forEach returns nothing
const nothing = combinationsForEach([1, 2], () => {});
expectType<typeof nothing, void>(true);

// Inputs: read-only arrays and typed arrays
const readOnly: readonly number[] = [1, 2];
combinationsForEach(readOnly, (a, b) => a + b);
combinationsForEach(new Uint8Array([1, 2]), (a, b) => a + b);

// Exported helper types
expectType<Combination<string, 2>, [string, string]>(true);
expectType<Combination<string, number>, string[]>(true);
const options: CombinationsOptions<3> = { size: 3 };
expectType<typeof options.size, 3 | undefined>(true);

// A size of 100 or more is too large for a tuple, so it falls back to a plain array
const large = combinationsFind([1, 2, 3], () => true, { size: 100 });
expectType<typeof large, number[] | undefined>(true);
const huge = combinationsFind([1, 2, 3], () => true, { size: 1e21 });
expectType<typeof huge, number[] | undefined>(true);
expectType<Combination<string, 99>["length"], 99>(true);
const veryLarge = combinationsFind([1, 2, 3], () => true, { size: 20000 });
expectType<typeof veryLarge, number[] | undefined>(true);

// Zero is a valid size
const none = combinationsMap([1, 2], (...items) => items, { size: 0 });
expectType<typeof none, [][]>(true);

// @ts-expect-error a negative size throws at runtime
combinationsMap([1, 2], () => {}, { size: -1 });

// @ts-expect-error a fractional size throws at runtime
combinationsMap([1, 2], () => {}, { size: 1.5 });

// @ts-expect-error a tiny fraction is written with an exponent, and still throws at runtime
combinationsMap([1, 2], () => {}, { size: 1e-7 });

// @ts-expect-error an invalid size is rejected in the options type too
const badOptions: CombinationsOptions<-2> = { size: -2 };

// @ts-expect-error a Set has no length, and throws at runtime
combinationsForEach(new Set([1, 2]), () => {});

// @ts-expect-error a size must be a number
combinationsForEach([1, 2], () => {}, { size: "2" });

// @ts-expect-error a pair callback can't take three items
combinationsForEach([1, 2], (a: number, b: number, c: number) => a + b + c);

// @ts-expect-error item types come from the array
combinationsMap([1, 2], (a: string) => a);
