/**
 * Test if the file is being ran from the command line, or was required/imported.
 * @returns {boolean} True if CLI, false if MODULE.
 */
export default function CLITest() {
	const [, , l] = new Error().stack.split("\n");
	return require.main.filename === /\((.*):\d+:\d+\)$/.exec(l)[1];
}
