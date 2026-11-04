# Combinations benchmarks

Compares `@sedware/utils` combinations against the public npm libraries that iterate fixed-size combinations, plus two
baselines. See the [benchmarks README](../README.md) for how to run them and the general rules.

```sh
npm run bench -- combinations
```

Results from a run are in [results.md](results.md).

## What is compared

| Implementation                                   | Notes                                                                                     |
|--------------------------------------------------|-------------------------------------------------------------------------------------------|
| `@sedware/utils`                                 | `combinationsForEach`, `combinationsMap`, `combinationsFind`. Reuses one array per walk.  |
| [`obliterator`](https://npm.im/obliterator)      | `combinations` iterator, plus `find`. Reuses one array, but rewrites every slot per step. |
| [`js-combinatorics`](https://npm.im/js-combinatorics) | `Combination` class. Yields a new array per combination.                             |
| [`generatorics`](https://npm.im/generatorics)    | `G.combination` recursive generator. Reuses one array.                                    |
| naive recursive                                  | The `flatMap` recursion often copied from Stack Overflow. Builds every combination first. |
| baseline: nested `for` loops                     | Hand-written loops for one fixed size. The fastest possible, but not reusable.            |

Left out: `itertools` and `iter-tools` no longer ship a `combinations` function, and `combinations` only returns every
size from a minimum up to the array length, never one fixed size.

## Scenarios

| File                   | Scenario                                         | Shows                                                     |
|------------------------|--------------------------------------------------|-----------------------------------------------------------|
| `pairs.bench.js`       | Sum of `a * b` over every pair, n = 10, 100, 1000 | Iteration overhead alone, nothing allocated for results  |
| `collect.bench.js`     | Collect every pair as a new `[a, b]`, n = 100, 1000 | The cost when everyone has to allocate the output     |
| `triples.bench.js`     | Sum of `a + b * c` over every triple, n = 50, 200 | A larger `size`                                         |
| `deep.bench.js`        | Size 10 of 20 items (184,756 combinations)        | Long combinations, where per-combination work adds up   |
| `find.bench.js`        | Find a pair that is first, midway, or missing, n = 1000 | Early exit                                        |
| `typed-array.bench.js` | Pairs from a `Float64Array`, n = 1000             | Array-like input                                         |

## Keeping it fair

- **Same combinations.** [gate.js](gate.js) checks that every library produces exactly the same combinations in the
  same order as `@sedware/utils` across a spread of sizes, before anything is timed.
- **Reused arrays.** `@sedware/utils`, `obliterator` and `generatorics` reuse one array between combinations.
  Wherever a combination is kept, as in the collect and find scenarios, each is copied so the results are equivalent.
- **Runtime sizes.** In `deep.bench.js` the size is only known at runtime, so `@sedware/utils` uses `(...items)`, which
  costs one array per call. That's what a user would write, so it isn't avoided.
- **Typed arrays.** `obliterator` only accepts plain arrays, so in `typed-array.bench.js` it includes the
  `Array.from` copy a user would need.
- **What other libraries offer.** `js-combinatorics` also offers random access (`.at(i)`) and BigInt counts, and
  `obliterator` is a wider iterator toolkit. These benchmarks only cover iterating every combination.
