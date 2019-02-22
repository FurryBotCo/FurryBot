module.exports = (async function(channel,user) {
	if(user.id !== this.user.id) return;
	this.analytics.track({
		userId: "CLIENT",
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
			this.analytics.track({
				userId: "CLIENT",
				event: "client.typingStart.manualStop",
				properties: {
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: this.os.hostname()
					},
					channelId: ch.id,
					channelName: ch.name,
					guildId: ch.guild.id,
					guildName: ch.guild.name

				}
			});
			ch.stopTyping(ch.typingCount);
			this.logger.debug(`Manually stopped typing in ${ch.name} (${ch.id}) of ${ch.guild.name} (${ch.guild.id})`);
		}
	},7e3,channel);
});