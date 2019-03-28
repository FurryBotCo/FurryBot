module.exports = (async function(id) {
	this.trackEvent({
		group: "EVENTS",
		event: "client.events.shardReady",
		properties: {
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: this.os.hostname()
			},
			id
		}
	});
	if(!this.logger) console.log(`Shard #${id} ready.`);
	else this.logger.log(`Shard #${id} ready.`);
	try {
		let data = {
			title: "Shard Status Update",
			description: `Shard ${id} is ready!`,
			timestamp: new Date().toISOString()
		};
		let embed = new this.Discord.MessageEmbed(data);
		this.config.bot.webhooks.shards.hook.send(embed);
	} catch(e) {
		if(!this.logger) console.error(e);
		this.logger.error(e);
	}
});