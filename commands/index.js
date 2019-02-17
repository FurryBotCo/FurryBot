const fs = require("fs"),
	path = require("path");

module.exports = fs.readdirSync(__dirname).map(name => path.join(__dirname,name)).filter(c=>fs.lstatSync(c).isDirectory()).map(c=>require(c));