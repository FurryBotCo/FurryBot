module.exports = {
	commands: require("fs").readdirSync(__dirname).filter(c => c !== "index.js").map(c => {
		let a = require(`${__dirname}/${c}`);
		Object.assign(a,{
			path:`${__dirname}/${c}`,
			category: __dirname.split("\\").reverse()[0]
		});
		delete require.cache[require.resolve(`${__dirname}/${c}`)];
		return a;
	}),
	name: "animals",
	displayName: ":dog: Animals",
	description: "Cute little animals to brighten your day!",
	path: __dirname
};