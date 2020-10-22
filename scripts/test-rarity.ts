import leeks from "leeks.js";
import { performance } from "perf_hooks";
import Utility from "../src/util/Functions/Utility";

const values = {
	COMMON: 32,
	UNCOMMON: 28,
	RARE: 22,
	EPIC: 16,
	LEGENDARY: 8
};
const a = Object.keys(values), b = Object.values(values);
const res = a.map(v => ({
	[v]: 0
})).reduce((a, b) => ({ ...a, ...b }));

const total = 10000000;
console.log(`Total To Be Tested: ${leeks.colors.blueBright(total.toLocaleString())}`);

let ran = 0, len = 0;

const start = performance.now();
for (let i = 0; i < total; i++) {
	const v = Utility.chooseWeighted(values);
	res[v]++;
	ran++;
	if ((i % (total / 10000)) === 0) {
		const txt = `Progress: ${i.toLocaleString()}/${total.toLocaleString()}\r`;
		len = txt.length;
		process.stdout.write(txt);
	}
}
process.stdout.write(`${" ".repeat(len)}\r`);
const end = performance.now();

const per = Object.keys(res).map(v => ({
	[v]: (res[v] / ran) * 100
})).reduce((a, b) => ({ ...a, ...b }));

console.log(`Total Tested: ${leeks.colors[total !== ran ? "redBright" : "greenBright"](ran.toLocaleString())}`);
console.log(`Elapsed Time: ${leeks.colors.cyanBright(`${(end - start).toFixed(3)}ms`)}`);
for (const k of Object.keys(res)) {
	const off = parseFloat((values[k] - parseFloat(per[k].toFixed(3))).toFixed(3)) * -1;
	console.log(`${leeks.colors.cyan(k)}: ${leeks.colors.blue(res[k].toLocaleString())} - ${leeks.colors.magenta(`${per[k].toFixed(3)}%`)} (Expected: ${leeks.colors.magentaBright(`${values[k]}%`)}, off by ${leeks.colors[off === 0 ? "greenBright" : off < 0 ? "redBright" : "green"](`${off.toString()}%`)})`);
}
