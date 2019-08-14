import * as fs from "fs-extra";

export default __filename.endsWith(".ts") ? fs.readdirSync(__dirname).filter(f => f !== "index.ts" && f.endsWith(".ts")).map(f => require(`${__dirname}/${f}`).default) : fs.readdirSync(__dirname).filter(f => f !== "index.js" && f.endsWith(".js")).map(f => require(`${__dirname}/${f}`).default);