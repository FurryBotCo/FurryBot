import { execSync } from "child_process";
import path from "path";
import rimraf from "rimraf";
import yargs from "yargs";
import CLITest from "./CLITest";

function build(del?: boolean) {
	if (del) {
		rimraf.sync(`${__dirname}/../build`);
		console.debug("[build.ts]: Removing previous built files.");
	} else console.debug("[build.ts]: Not removing previous built files.");

	const o = execSync("tsc -b --verbose", {
		cwd: path.resolve(`${__dirname}/../`)
	});

	console.log(o.toString());
	return true;
}

// cli
if (CLITest()) {
	console.debug("[build.ts]: Running in CLI mode");
	build(!!yargs.argv.del);
}
// module
else {
	console.debug("[build.ts]: Running in MODULE mode");
}

// export
export default build;
