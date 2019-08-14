import * as fs from "fs";
import AutoResponse from "../modules/cmd/AutoResponse";

/*
ordering by category name
fs.readdirSync(__dirname).filter(d => fs.lstatSync(`${__dirname}/${d}`).isDirectory()).map(f => ({ [require(`${__dirname}/${f}`).default.triggers[0]]: require(`${__dirname}/${f}`).default })).reduce((a, b) => { a[Object.keys(b)[0]] = Object.values(b)[0]; return a; }, {})
*/

export default __filename.endsWith(".ts") ? fs.readdirSync(__dirname).filter(f => f !== "index.ts" && f.endsWith(".ts")).map(f => require(`${__dirname}/${f}`).default) : fs.readdirSync(__dirname).filter(f => f !== "index.js" && f.endsWith(".js")).map(f => require(`${__dirname}/${f}`).default) as AutoResponse[];