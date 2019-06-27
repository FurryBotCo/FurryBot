import * as fs from "fs";

export default fs.readdirSync(__dirname).filter(f => f !== "index.ts" && f.endsWith(".ts")).map(f => require(`${__dirname}/${f}`).default);