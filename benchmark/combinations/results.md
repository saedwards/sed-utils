# Results

Measured on 2026-11-03, with two full runs of `npm run bench`, each scenario in a fresh process.

```text
node v24.22.1 · darwin 25.6.0 x64 · Intel(R) Core(TM) i5-1038NG7 CPU @ 2.00GHz
generatorics@1.1.0 · js-combinatorics@2.1.4 · mitata@1.0.34 · obliterator@2.0.5
```

The machine was not idle during these runs, so treat the figures as indicative. The two runs agreed closely, and
where they differed, both figures are shown.

## How much faster `@sedware/utils` is

Each cell shows how many times faster `@sedware/utils` was than that implementation. Below 1× means `@sedware/utils`
was slower. For example, 0.5× means it took twice as long.

| Scenario                         | obliterator | js-combinatorics | generatorics | naive recursive | nested `for` loops |
|----------------------------------|-------------|------------------|--------------|-----------------|--------------------|
| Pairs, sum, n=10                 | 2.0×        | 13×              | 24×          | 23–24×          | 0.26–0.27×         |
| Pairs, sum, n=100                | 2.0–2.3×    | 5.8–6.3×         | 19–20×       | 24–25×          | 0.23×              |
| Pairs, sum, n=1000               | 2.9–3.0×    | 6.7×             | 24–28×       | 92–93×          | 0.22×              |
| Collect pairs, n=100             | 3.0–3.7×    | 13–29×           | 13–21×       | 4.2–12×         | 0.87–0.93×         |
| Collect pairs, n=1000            | 0.87×       | 1.7–2.1×         | 2.6–2.9×     | 7.0–7.5×        | 0.94–0.97×         |
| Triples, sum, n=50               | 2.5–2.6×    | 6.1–6.5×         | 23–24×       | 35–36×          | 0.36–0.37×         |
| Triples, sum, n=200              | 2.8–2.9×    | 6.3–6.4×         | 24–25×       | not run         | 0.19×              |
| Size 10 of 20, sum of every item | 1.7×        | 2.3×             | 13×          | 34–35×          | n/a                |
| Find, first pair, n=1000         | 0.88–0.91×  | 41–43×           | 24–25×       | 2,600,000×      | 0.12–0.13×         |
| Find, middle pair, n=1000        | 4.1–4.2×    | 9.8–9.9×         | 36×          | 470–490×        | 0.70–0.77×         |
| Find, no match, n=1000           | 3.9–4.2×    | 9.5–10×          | 36–37×       | 133–135×        | 0.68–0.70×         |
| `Float64Array` pairs, n=1000     | 2.9×        | 17×              | 23–24×       | n/a             | 0.22×              |

Collecting 100 pairs is dominated by garbage collection, so its figures vary most between runs.

## What this shows

- **Faster than every other library in almost every scenario,** including obliterator, usually by 2–4×.
- **Two exceptions.** When a `find` matches the very first pair, obliterator is about 10% faster, because there's
  almost no iteration to save and setup cost dominates. When collecting 1000 pairs, obliterator is about 15% faster,
  because the time goes on allocating half a million result arrays, not on iterating.
- **Hand-written loops are faster for plain iteration.** They're 3–5× faster than `@sedware/utils` when summing
  numbers. Searching and collecting come close to them (0.7–0.97×), as the callback's own work dominates there.

## Why it's fast

All three functions share one walk, which calls your callback directly and handles the result itself. For pairs and
triples, the items are passed as separate arguments without spreading an array. Larger sizes spread the walk's
reused array into the callback's arguments, so they gain less, but they're still 1.7× faster than obliterator.

Results before this change, when each function wrapped the walk in its own callback and every size used a spread,
were about even with obliterator.
