# @sedware/utils

A collection of small, typed, dependency-free functional utilities for JavaScript and TypeScript.

```js
import {combinationsMap} from "@sedware/utils";

combinationsMap(["a", "b", "c"], (x, y) => x + y);
// ["ab", "ac", "bc"]
```

## Features

- **One install:** Every utility comes from a single package and a single import path.
- **Tree-shakeable:** The package is marked side-effect free, so bundlers only include the utilities you import.
- **TypeScript types included:** Written in TypeScript, with declaration files shipped.
- **No runtime dependencies.**

## Installation

```sh
npm install @sedware/utils
```

This package ships as ESM and requires Node 20.19+ or 22.12+. On those versions, CommonJS code can load it with `require()`:

```js
const {combinationsMap} = require("@sedware/utils");
```

If your runtime or tooling can't `require()` ESM, use a dynamic `import()` instead:

```js
const {combinationsMap} = await import("@sedware/utils");
```

## Utilities

| Area                          | Utility               | Description                                                     |
|-------------------------------|-----------------------|-----------------------------------------------------------------|
| [Combinations](#combinations) | `combinationsMap`     | Collect the result of a function over every unique combination. |
| [Combinations](#combinations) | `combinationsForEach` | Run a function over every unique combination.                   |
| [Combinations](#combinations) | `combinationsFind`    | Find the first unique combination that matches a predicate.     |

## Combinations

Functional approach to combinatorial iteration.
Run a function over every unique combination of items in an array.

Each group of items is visited exactly once. An item is never paired with itself, and `(b, a)` is never visited after
`(a, b)`.

- **Any combination size:** Pairs combinations by default, or triples and beyond with the `size` option.
- **Predictable order:** Combinations follow the order of the input array in a predictable way.
- **Early exit:** `combinationsFind` stops at the first match.
- **Array-likes supported:** works with arrays, typed arrays and anything else with a numeric `length`.
- **Typed callbacks:** callback arguments and results are typed from the array and `size`.

### Usage

#### Compare every pair

Use `combinationsMap` when you want to collect the results of every combination.

```js
import {combinationsMap} from "@sedware/utils";

const cities = [
  {name: "Leeds", x: 0},
  {name: "York", x: 40},
  {name: "Hull", x: 95},
];

combinationsMap(cities, (a, b) => `${a.name}-${b.name}: ${Math.abs(a.x - b.x)}`);
// ["Leeds-York: 40", "Leeds-Hull: 95", "York-Hull: 55"]
```

#### Run side effects

Use `combinationsForEach` when you don't need the results.

```js
import {combinationsForEach} from "@sedware/utils";

const teamRelations = [];
combinationsForEach(["Dave", "John", "Jane"], (a, b) => {
  teamRelations.push(`${a} knows ${b}`);
});
// teamRelations: ["Dave knows John", "Dave knows Jane", "John knows Jane"]
```

#### Find the first match

```js
import {combinationsFind} from "@sedware/utils";

combinationsFind([1, 2, 3, 4], (a, b) => a + b === 5);
// [1, 4]

combinationsFind([1, 2, 3, 4], (a, b) => a + b === 100);
// undefined
```

#### Choose a combination size

Use the `size` option to optionally choose how many items are in each combination.
The size window determines the callback arity and the result type. The default is `2` for pairs.

```js
import {combinationsMap} from "@sedware/utils";

combinationsMap([1, 2, 3, 4], (...items) => items, {size: 3});
// [[1, 2, 3], [1, 2, 4], [1, 3, 4], [2, 3, 4]]
```

### API

All three functions take the same first and last arguments:

| Parameter      | Type           | Description                                            |
|----------------|----------------|--------------------------------------------------------|
| `array`        | `ArrayLike<T>` | The items to combine. It is not modified.              |
| `options.size` | `number`       | The number of items in each combination. Default: `2`. |

The callback receives the items of each combination as separate arguments: `(a, b)` for pairs and `(a, b, c)` for
triples. Use `(...items)` to collect them into an array.

#### `combinationsMap(array, method, options?)`

Calls `method` with every combination and returns an array of its results, in order.

#### `combinationsForEach(array, method, options?)`

Calls `method` with every combination and returns `undefined`. It can't be stopped early, except by throwing.

#### `combinationsFind(array, predicate, options?)`

Calls `predicate` with each combination until it returns a truthy value. Returns a new array holding that combination,
or `undefined` if nothing matched.

### Behaviour

#### Order

Combinations are visited in lexicographic order of their positions in the array, with the last position changing
fastest:

```text
[1, 2, 3, 4] with size 2:  [1, 2] [1, 3] [1, 4] [2, 3] [2, 4] [3, 4]
```

#### What "unique" means

Uniqueness is based on **array position, not value**, so duplicates in the input are treated as separate items. 
If you need unique values, remove the duplicates first:

```js
combinationsMap([1, 1, 1], (...items) => items);
// [[1, 1], [1, 1], [1, 1]]

combinationsMap([...new Set([1, 1, 2])], (...items) => items);
// [[1, 2]]
```

#### Edge cases

| Input                                    | Result                                                                                                             |
|------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| `size` is `0`, or larger than the array  | The callback is never called. `map` returns `[]`, `find` returns `undefined`.                                      |
| `size` is not a whole number             | Throws `Error`: `'size' must be a whole number`                                                                    |
| `size` is negative                       | Throws `Error`: `'size' must be a positive number`                                                                 |
| `array` has no whole number `length`     | Throws `TypeError`: `'array' must be an array`. This includes `Set` and `Map`, so spread them into an array first. |
| Sparse array                             | Holes are visited as `undefined`.                                                                                  |
| Items added to the array during the walk | They are not visited.                                                                                              |
| The callback throws                      | The error propagates and the walk stops.                                                                           |

#### Performance

For a fixed number of items, a larger `size` doesn't always mean more calls. The count peaks when `size` is half the
number of items, then falls back to a single call when `size` matches the number of items:

| `size` with 10 items | 1  | 2  | 3   | 4   | 5   | 6   | 7   | 8  | 9  | 10 |
|----------------------|----|----|-----|-----|-----|-----|-----|----|----|----|
| Calls                | 10 | 45 | 120 | 210 | 252 | 210 | 120 | 45 | 10 | 1  |

`combinationsMap` keeps every result in memory, so prefer `combinationsForEach` or `combinationsFind` for large
inputs.

#### Benchmarks

Compared with other npm libraries for iterating combinations (Node 24, n=1000 pairs unless noted):

| Scenario                | vs js-combinatorics | vs generatorics | vs obliterator |
|-------------------------|---------------------|-----------------|----------------|
| Iterate pairs           | 6.7× faster         | 24× faster      | 3× faster      |
| Iterate triples (n=200) | 6.3× faster         | 24× faster      | 2.8× faster    |
| Size 10 of 20 items     | 2.3× faster         | 13× faster      | 1.7× faster    |
| Find, match midway      | 9.9× faster         | 36× faster      | 4.1× faster    |

obliterator is slightly faster in two cases: when a `find` matches the first pair, and when collecting 1000 pairs,
where allocating the results takes most of the time. Hand-written nested loops are faster than any library. See [benchmark/combinations/](benchmark/combinations/) for the method, every scenario, and full
[results](benchmark/combinations/results.md). Run them yourself with `npm install --prefix benchmark && npm run bench`.

### TypeScript

When `size` is a literal, the callback arguments and results are typed as an exact tuple. When it is only known at
runtime, or is 100 or more, they fall back to a plain array. A literal size that would throw at runtime, such as `-1`
or `1.5`, is a compile error.

```ts
import {combinationsFind, type Combination, type CombinationsOptions} from "@sedware/utils";

const pair = combinationsFind([1, 2, 3], (a, b) => a + b === 5);
// [number, number] | undefined

const triple = combinationsFind(["a", "b", "c"], () => true, {size: 3});
// [string, string, string] | undefined

const size: number = 3;
const dynamic = combinationsFind([1, 2, 3], () => true, {size});
// number[] | undefined

type Pair = Combination<string, 2>;
// [string, string]

const options: CombinationsOptions<3> = {size: 3};
```

## Development

```sh
npm install
npm test            # Run the Jest test suite
npm run typecheck   # Type check the source, tests and type-tests.ts
npm run test:all    # Type check, then run the tests
npm run build       # Compile to JavaScript and declaration files in dist/
```

The source is TypeScript using only syntax Node can strip (`erasableSyntaxOnly`), so the `.ts` files run directly with
Node 24 or later. Jest loads them through Node's own type stripping, in `jest-strip-types.js`.

`dist/` is generated and not committed. Node won't strip types from packages in `node_modules`, so the published
package ships compiled JavaScript. `npm pack` and `npm publish` run the type check, tests and build automatically.

### Project layout

```text
index.ts                  Public entry point, re-exports every utility
index.test.ts             Guards the exact list of public exports
type-tests.ts             Compile-time checks for the public types
combinations-map.ts       Public utilities live at the root, each with a .test.ts
combinations-find.ts
combinations-for-each.ts
combinations/             Private implementation details for one area, never exported directly
benchmark/                Benchmarks against other libraries, with their own package.json, not published
```

### Adding a utility

1. Add the public function as a root file, for example `foo-bar.ts`, with `foo-bar.test.ts` beside it.
2. Put any private helpers in a folder named after the area, for example `foo/`.
3. Re-export the function and any public types from `index.ts`, and add the name to the list in `index.test.ts`.
4. Add compile-time checks to `type-tests.ts`.
5. Add a row to the [Utilities](#utilities) table and a section to this README.

## License

[MIT](https://opensource.org/license/mit) © Shane Edwards
