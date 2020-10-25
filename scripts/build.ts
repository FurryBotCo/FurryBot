import { exec } from "child_process";
import path from "path";
import rimraf from "rimraf";
import yargs from "yargs";
import CLITest from "./CLITest";
import deasync from "deasync";

function build(del?: boolean) {
  return deasync((err, cb) => {
    let e: Error | null = null;
		if (del) {
			rimraf.sync(`${__dirname}/../build`);
			console.debug("[build.ts]: Removing previous built files.");
		} else console.debug("[build.ts]: Not removing previous built files.");

		let result = false;
		const child = exec("tsc -b --verbose", { cwd: path.resolve(`${__dirname}/../`) });
		child.stdout.on("data", console.debug);
		child
			.on("error", (error) => {
				console.warn("[build.ts]: `tsc` command has failed to run, view below for stacktrace");
				console.error(error);
        result = false;
        e = error;
        
			})
			.on("exit", (code, signal) => {
				console.info(`[build.ts]: \`tsc\` command closed with exit code ${code}${signal ? ` with signal "${signal}"` : ""} (success: ${code === 0 ? "yes" : "no"})`);
				if (code === 0) result = true;
				return cb(e, result);
			});
	})();
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
