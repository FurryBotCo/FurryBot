module.exports = {
	commands: require("fs").readdirSync(__dirname).filter(c => c !== "index.js" && c.endsWith("js")).map(c => {
		let a = require(`${__dirname}/${c}`);
		Object.assign(a,{
			path:`${__dirname}/${c}`,
			category: __dirname.split("\\").reverse()[0]
		});
		delete require.cache[require.resolve(`${__dirname}/${c}`)];
		return a;
	}),
	name: "logging",
	displayName: ":gear: Logging",
	description: "Keep track of what's happing in your server.",
	path: __dirname
};
