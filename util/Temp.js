module.exports = ((dir) => {
	const fs = require("fs");
	if(!fs.existsSync(dir)) fs.mkdirSync(dir);

	const clean = (() => fs.readdirSync(dir).map(d => fs.unlinkSync(`${dir}/${d}`)));

	process.on("exit",clean)
		.on("SIGINT",clean)
		.on("SIGTERM",clean);
	
	return Object.assign({
		dir,
		clean
	},fs);
});