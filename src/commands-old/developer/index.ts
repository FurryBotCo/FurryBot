/*
ordering by first command trigger
fs.readdirSync(__dirname).filter(d => (d.endsWith(".js") || d.endsWith(".ts")) && !fs.lstatSync(`${__dirname}/${d}`).isDirectory() && !d.match(/index\.(t|j)s/)).map(f => ({ [require(`${__dirname}/${f}`).default.triggers[0]]: require(`${__dirname}/${f}`).default })).reduce((a, b) => { a[Object.keys(b)[0]] = Object.values(b)[0]; return a; }, {})
*/

export default {
	displayName: ":tools: Developer",
	name: "developer",
	description: "Commands to make development easier."
};