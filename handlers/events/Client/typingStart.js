module.exports = (async function(channel,user) {
	if(user.id !== this.user.id) return;
	this.trackEvent({
		group: "EVENTS",
		userId: user.id,
		channelId: channel.id,
		event: "client.events.typingStart",
		properties: {
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: this.os.hostname()
			}
		}
	});
	setTimeout((ch) => {
		if(ch.typing) {
			this.trackEvent({
				group: "EVENTS",
				guildId: ch.guild.id,
				channelId: ch.id,
				event: "client.typingStart.manualStop",
				properties: {
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: this.os.hostname()
					},
					channelName: ch.name,
					guildName: ch.guild.name

				}
			});
			ch.stopTyping(ch.typingCount);
			this.logger.debug(`Manually stopped typing in ${ch.name} (${ch.id}) of ${ch.guild.name} (${ch.guild.id})`);
		}
	},7e3,channel);
});