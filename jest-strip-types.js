import { stripTypeScriptTypes } from "node:module";

/**
 * Lets Jest load the .ts sources using Node's own type stripping.
 * Types are replaced with whitespace, so line numbers in errors stay correct.
 */
export default {
	process: sourceText => ({ code: stripTypeScriptTypes(sourceText) }),
};
