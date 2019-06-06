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

module.exports = (async function (message, emoji, userID) {
	this.trackEvent({
		group: "EVENTS",
		userId: typeof userID !== "undefined" ? userID : null,
		event: "client.events.messageReactionAdd",
		properties: {
			bot: {
				version: config.bot.version,
				beta: config.beta,
				alpha: config.alpha,
				server: os.hostname()
			}
		}
	});

});