import * as fs from "fs";
import pkg from "../package.json";
import CLITest from "./CLITest";

function version(v?: string | null) {
	const d = new Date();
	const o = String(pkg.version);
	const oV = o.split("-")[0];
	if (!v) v = pkg.version.split("-")[0];
	pkg.version = `${v}-${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, "0")}${d.getDate().toString().padStart(2, "0")}`;

	if (o === pkg.version) {
		console.log("[version.ts]: Version did not change.");
		return false;
	}

	console.log(`[version.ts]: Changed version from "${oV}" (Build: ${o.split("-")[1]}) to "${v}" (Build: ${pkg.version.split("-")[1]})`);
	fs.writeFileSync(`${__dirname}/../package.json`, `${JSON.stringify(pkg, null, 2)}\n`);
	return true
}

console.log(process.argv);

// cli
if (CLITest()) {
	console.debug("[version.ts]: Running in CLI mode");
	version(process.argv[2] || null);
}
// module
else {
	console.debug("[version.ts]: Running in MODULE mode");
}

// export
export default version;
