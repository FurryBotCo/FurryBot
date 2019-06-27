import * as fs from "fs";
import Category from "@modules/cmd/Category";

/*
ordering by category name
fs.readdirSync(__dirname).filter(d => fs.lstatSync(`${__dirname}/${d}`).isDirectory()).map(f => ({ [require(`${__dirname}/${f}`).default.triggers[0]]: require(`${__dirname}/${f}`).default })).reduce((a, b) => { a[Object.keys(b)[0]] = Object.values(b)[0]; return a; }, {})
*/

export default fs.readdirSync(__dirname).filter(d => fs.lstatSync(`${__dirname}/${d}`).isDirectory()).map(f => {
    let c;
    if (fs.existsSync(`${__dirname}/${f}/index.ts`)) {
        c = require(`${__dirname}/${f}/index.ts`).default;
    } else if (fs.existsSync(`${__dirname}/${f}/index.js`)) {
        c = require(`${__dirname}/${f}/index.js`).default;
    } else {
        throw new TypeError(`missing category index for ${f}`);
    }
    let cmd = fs.readdirSync(`${__dirname}/${f}`).filter(d => (d.endsWith(".js") || d.endsWith(".ts")) && !fs.lstatSync(`${__dirname}/${f}/${d}`).isDirectory() && !d.match(/index\.(t|j)s/)).map(j => require(`${__dirname}/${f}/${j}`).default)
    cmd.map(cc => cc.category = new Category({
        name: c.name,
        displayName: c.displayName,
        description: c.description,
        path: `${__dirname}/${f}`
    }));
    return new Category({
        name: c.name,
        displayName: c.displayName,
        description: c.description,
        triggers: cmd.map(c => c.triggers).reduce((a, b) => a.concat(b)),
        commands: cmd,
        path: `${__dirname}/${f}`
    });
})