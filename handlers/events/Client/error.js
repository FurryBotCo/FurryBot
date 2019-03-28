module.exports = (async function(error) {
	this.trackEvent({
		group: "EVENTS",
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
	if(!this.logger) console.error(error);
	else this.logger.error(error);

	try {
		let data = {
			title: "Client Error",
			description: error,
			timestamp: new Date().toISOString()
		};
		let embed = new this.Discord.MessageEmbed(data);
		await this.config.bot.webhooks.errors.hook.send(embed);
	} catch(e) {
		if(!this.logger) console.error(e);
		else this.logger.error(e);
	}
	return true;
});