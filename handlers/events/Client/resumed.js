module.exports = (async function(replayed) {
	if(!this.logger) console.log(`Resumed ${replayed} events.`);
	else this.logger.debug(`Resumed ${replayed} events.`);
	this.trackEvent({
		group: "EVENTS",
		event: "client.events.resumed",
		properties: {
			replayed,
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: this.os.hostname()
			}
		}
	});
});