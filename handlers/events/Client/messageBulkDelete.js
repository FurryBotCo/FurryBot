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

module.exports = (async function (messages) {
	this.trackEvent({
		group: "EVENTS",
		event: "client.events.messageBulkDelete",
		properties: {
			bot: {
				version: config.bot.version,
				beta: config.beta,
				alpha: config.alpha,
				server: os.hostname()
			}
		}
	});
	if (!this || !mdb || !messages || messages.length === 0) return;
	return messages.map(m => this.emit("messageDelete", m));
});