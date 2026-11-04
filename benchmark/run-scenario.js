/**
 * Runs one scenario file. Started by run.js in a fresh process.
 * Importing the file runs its correctness gate, then registers its benchmarks.
 *
 *   node --expose-gc run-scenario.js combinations/pairs [--markdown]
 */
import { run } from "mitata";

const [name, ...flags] = process.argv.slice(2);

await import(`./${name}.bench.js`);
await run({
	throw: true,
	format: flags.includes("--markdown") ? "markdown" : "mitata",
});
