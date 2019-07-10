import * as fs from "fs";
import AutoResponse from "@modules/cmd/AutoResponse";

/*
ordering by category name
fs.readdirSync(__dirname).filter(d => fs.lstatSync(`${__dirname}/${d}`).isDirectory()).map(f => ({ [require(`${__dirname}/${f}`).default.triggers[0]]: require(`${__dirname}/${f}`).default })).reduce((a, b) => { a[Object.keys(b)[0]] = Object.values(b)[0]; return a; }, {})
*/

// have to do some weird typescript magic for this to work property
const responses: AutoResponse[] = fs.readdirSync(__dirname).filter(d => !fs.lstatSync(`${__dirname}/${d}`).isDirectory() && d !== "index.ts").map(f => require(`${__dirname}/${f}`).default);

export default responses;