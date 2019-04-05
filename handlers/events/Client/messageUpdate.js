module.exports = (async function(message,oldMessage) {
	if(!this || !this.mdb || message.author.bot || !message || !oldMessage || message.channel.type !== 0) return;
	this.bot.emit("messageCreate",message);
	if(!message.channel.guild || ![0,2,4].includes(message.channel.type)) return;
	this.trackEvent({
		group: "EVENTS",
		userId: "CLIENT",
		event: "client.events.messageUpdate",
		properties: {
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: require("os").hostname()
			}
		}
	});
});