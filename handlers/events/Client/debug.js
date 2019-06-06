const {
	config,
	os,
	util,
	phin,
	performance,
	Database: {
		MongoClient,
		mongo,
		mdb
	},
	functions
} = require("../../../modules/CommandRequire");

module.exports = (async function (info) {
	if (typeof config !== "undefined" && config.debug === true) {
		if (["Duplicate presence update"].some(t => info.toLowerCase().indexOf(t.toLowerCase()) !== -1)) return;
		if (this.logger !== undefined) return this.logger.debug(info);
		else return console.debug(info);
	}
});