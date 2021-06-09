import * as fs from "fs-extra";
const d = new Date();
const buildDate = `${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, "0")}${(d.getDate()).toString().padStart(2, "0")}`;
const pkg = JSON.parse(fs.readFileSync(`${__dirname}/../package.json`).toString()) as typeof import("../package.json");
(pkg as { buildDate: string | null; }).buildDate = buildDate;
fs.writeFileSync(`${__dirname}/../package.json`, JSON.stringify(pkg, null, "  "));

console.log("Version:", pkg.version);
console.log("Build Date", buildDate, `(${(d.getMonth() + 1).toString().padStart(2, "0")}/${(d.getDate()).toString().padStart(2, "0")}/${d.getFullYear()})`);
