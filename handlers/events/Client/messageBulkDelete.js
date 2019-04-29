module.exports = (async function(messages) {
	this.trackEvent({
		group: "EVENTS",
		event: "client.events.messageBulkDelete",
		properties: {
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: require("os").hostname()
			}
		}
	});
	if(!this || !this.mdb || !messages || messages.length === 0) return;
	return messages.map(m => this.emit("messageDelete",m));
});