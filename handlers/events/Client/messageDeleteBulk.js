module.exports = (async function(messages) {
	if(!messages || !this.db) return;
	if(messages.size < 1) return;
	this.analytics.track({
		userId: "CLIENT",
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