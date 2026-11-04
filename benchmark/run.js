/**
 * Runs benchmark scenarios, each in its own fresh Node process.
 *
 * Every folder here is one util, and every <util>/<name>.bench.js in it is
 * one scenario. A util may have a gate.js, a correctness check that runs
 * here in the parent, which times nothing, before any of its scenarios.
 *
 * A separate process per scenario keeps one scenario's inputs (typed arrays,
 * other sizes, other callbacks) from changing how V8 optimises the next one,
 * so every library is measured from the same clean start.
 *
 *   node --expose-gc run.js                                  every scenario
 *   node --expose-gc run.js combinations                     every combinations scenario
 *   node --expose-gc run.js combinations/pairs combinations/find
 *   node --expose-gc run.js --markdown                       markdown tables
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { arch, cpus, platform, release } from "node:os";
import { fileURLToPath } from "node:url";
import { versions } from "./harness.js";

const root = fileURLToPath(new URL(".", import.meta.url));

/**
 * Every scenario as "<util>/<name>", found from the folders on disk.
 */
const scenarios = readdirSync(root, { withFileTypes: true })
	.filter(entry => entry.isDirectory() && entry.name !== "node_modules")
	.flatMap(({ name: util }) => readdirSync(new URL(`${util}/`, import.meta.url))
		.filter(file => file.endsWith(".bench.js"))
		.map(file => `${util}/${file.slice(0, -".bench.js".length)}`))
	.sort();

const args = process.argv.slice(2);
const flags = args.filter(arg => arg.startsWith("--"));
const filters = args.filter(arg => !arg.startsWith("--"));

const selected = filters.length
	? scenarios.filter(id => filters.some(filter => id === filter || id.startsWith(`${filter}/`)))
	: scenarios;
for(const filter of filters) {
	if(!scenarios.some(id => id === filter || id.startsWith(`${filter}/`))) {
		throw Error(`Unknown util or scenario '${filter}'. Choose from: ${scenarios.join(", ")}`);
	}
}

for(const util of new Set(selected.map(id => id.split("/")[0]))) {
	if(existsSync(new URL(`${util}/gate.js`, import.meta.url))) {
		await import(`./${util}/gate.js`);
	}
}

console.log(`node ${process.version} · ${platform()} ${release()} ${arch()} · ${cpus()[0].model}`);
console.log(Object.entries(versions).map(([name, version]) => `${name}@${version}`).join(" · "));
console.log();

const scenarioRunner = fileURLToPath(new URL("run-scenario.js", import.meta.url));
for(const id of selected) {
	const { status } = spawnSync(process.execPath, ["--expose-gc", scenarioRunner, id, ...flags], {
		stdio: "inherit",
	});
	if(status !== 0) {
		process.exit(status ?? 1);
	}
}
