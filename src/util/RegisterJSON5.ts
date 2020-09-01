// JSON5 op
const fs = require("fs");
const JSON5 = require("json5");

function parseJSON5(module: any, filename: string) {
	const content = fs.readFileSync(filename, "utf8");
	try {
		module.exports = JSON5.parse(content);
	} catch (err) {
		err.message = `${filename}: ${err.message}`;
		throw err;
	}
}

require.extensions[".json5"] = parseJSON5;
require.extensions[".json"] = parseJSON5;
