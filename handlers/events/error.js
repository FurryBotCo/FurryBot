module.exports = (async function(error) {
	this.analytics.track({
		userId: "CLIENT",
		event: "client.events.error",
		properties: {
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: this.os.hostname()
			},
			error
		}
	});
	if(!this.logger) console.log(error);
	else this.logger.error(error);
});