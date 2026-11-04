# Benchmarks

Compares `@sedware/utils` against public npm alternatives and hand-written baselines. This folder is not published,
and its dependencies never touch the main package.

| Util                            | Compared with                                           | Results                                         |
|---------------------------------|---------------------------------------------------------|-------------------------------------------------|
| [combinations](combinations/)   | obliterator, js-combinatorics, generatorics, naive, loops | [combinations/results.md](combinations/results.md) |

```sh
# From the repository root: build dist/, then run every scenario
npm install --prefix benchmark
npm run bench

# One util, or only some scenarios
npm run bench -- combinations
npm run bench -- combinations/pairs combinations/find

# Markdown tables instead of the terminal view
npm run bench -- --markdown
```

The benchmarks import the built `dist/`, so they measure exactly what is installed from npm. Every run starts with the
Node version, the machine, and the exact version of every library in [package.json](package.json).

## Layout

```
benchmark/
  run.js             finds every <util>/<name>.bench.js and runs each in a fresh Node process
  run-scenario.js    runs one scenario file, started by run.js
  harness.js         generic helpers: scenario(), assertResult(), range(), versions
  package.json       every competitor library, pinned to an exact version
  <util>/
    README.md        what is compared, and the scenarios
    results.md       numbers from a run
    shared.js        competitor imports and adapters for this util
    gate.js          optional correctness check, run once before this util's scenarios
    <name>.bench.js  one scenario
```

A separate process per scenario keeps one scenario's inputs from changing how V8 optimises the next, so every library
is measured from the same clean start.

## Adding a util

1. Create a folder named after the util, for example `benchmark/chunk/`.
2. Add competitor libraries to [package.json](package.json) with exact versions, no `^` or `~`.
3. Put competitor imports and any adapters in `<util>/shared.js`, importing the util from `../../dist/index.js`.
4. If the util's output can be compared across libraries in general, add a `<util>/gate.js` that throws on any
   mismatch. `run.js` imports it before timing anything for that util.
5. Write one `<name>.bench.js` per scenario. Each calls `scenario(title, implementations, expected)` from
   `../harness.js`. Name the `@sedware/utils` implementation starting with `@sedware/utils` so it is the baseline.
6. Add a `README.md` and `results.md` to the folder, and a row to the table above.

`run.js` finds the new scenarios on its own.

## Keeping it fair

- **Correctness gate first.** Every timed function must return the expected result before it is timed, and a util's
  `gate.js` checks every library against `@sedware/utils` over a spread of inputs. Any mismatch stops the run, so
  nothing can look fast by doing less.
- **Same work.** Every implementation in a group does the same work on the same input, built once outside the timed
  function. Results go through mitata's `do_not_optimize` so V8 can't drop the work.
- **Idiomatic use.** Each library is called the way its docs show, without hand-tuning. Setup that a user would always
  pay is included.

Each util's README lists the choices specific to it.

Each run reports the time per iteration (avg, min to max, p75 / p99) and, with `--expose-gc` (set by `npm run bench`),
the heap allocated per iteration. Each group ends with a summary relative to `@sedware/utils`.

## Getting stable numbers

Benchmarks are noisy. Before you publish numbers:

- Plug in the machine, close other apps, and don't use it during the run.
- Run the suite three times. Only trust results that agree within about 5%.
- Don't use CI for timings, as shared runners vary too much. The correctness gates can still run there.
