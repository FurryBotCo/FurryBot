module.exports = (async function(info) {
	if(!this.logger) console.warn(info);
	else this.logger.warn(info);
	this.analytics.track({
		userId: "CLIENT",
		event: "client.events.warn",
		properties: {
			info,
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: this.os.hostname()
			}
		}
	});
});