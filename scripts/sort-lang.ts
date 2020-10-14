import * as fs from "fs-extra";
const o = `${__dirname}/../src/config/lang`;
import JSON5 from "json5";
import { performance } from "perf_hooks";
function loop(d: string) {
	fs.readdirSync(d).map(v => {
		if (fs.lstatSync(`${d}/${v}`).isDirectory()) return loop(`${d}/${v}`);
		else {
			const j = `${d}/${v}`.replace(o, "").slice(1);
			const start = performance.now();
			const f = JSON5.parse(fs.readFileSync(`${d}/${v}`).toString());
			const obj = {};
			Object.keys(f).sort().map(k => obj[k] = f[k]);
			// need to stringify with JSON because JSON5 will output without quotes on property names
			fs.writeFileSync(`${d}/${v}`, `${JSON.stringify(obj, null, "\t")}\n`);
			const end = performance.now();
			console.log(`sorting of "${j}" took ${(end - start).toFixed(3)}ms`);
		}
	});
}
loop(o);
