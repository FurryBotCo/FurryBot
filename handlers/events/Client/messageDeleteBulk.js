module.exports = (async function(messages) {
	if(!messages || !this.db) return;
	if(messages.size < 1) return;
	this.trackEvent({
		group: "EVENTS",
		channelId: messages.first().channel.id,
		guildId: messages.first().guild.id,
		event: "client.events.messageDeleteBulk",
		properties: {
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: this.os.hostname()
			}
		}
	});
	return messages.map(m => this.emit("messageDelete",m));
});