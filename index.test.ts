import { describe, expect, test } from "@jest/globals";
import * as api from "./index.ts";
import { combinationsFind } from "./combinations-find.ts";
import { combinationsForEach } from "./combinations-for-each.ts";
import { combinationsMap } from "./combinations-map.ts";

describe("public interface", () => {
	test("exposes exactly the public utilities", () => {
		expect(Object.keys(api).sort()).toEqual([
			"combinationsFind",
			"combinationsForEach",
			"combinationsMap",
		]);
	});

	test("re-exports each function from its own module", () => {
		expect(api.combinationsFind).toBe(combinationsFind);
		expect(api.combinationsForEach).toBe(combinationsForEach);
		expect(api.combinationsMap).toBe(combinationsMap);
	});
});
