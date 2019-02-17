module.exports = (async function(rateLimitInfo) {
	this.analytics.track({
		userId: "CLIENT",
		event: "client.events.rateLimit",
		properties: {
			rateLimitInfo,
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: this.os.hostname()
			}
		}
	});
	let data, embed;
	if(!this.logger) console.log(`Ratelimit: ${this.util.inspect(rateLimitInfo,{showHidden: true, depth: null, color: true})}`);
	else this.logger.warn(`Ratelimit: ${this.util.inspect(rateLimitInfo,{showHidden: true, depth: null, color: true})}`);
	data = {
		title: `Ratelimited - Timeout: ${this.ms(rateLimitInfo.timeout)}`,
		fields: [
			{
				name: "Limit",
				value: rateLimitInfo.limit,
				inline: false
			},{
				name: "Method",
				value: rateLimitInfo.method.toUpperCase(),
				inline: false
			},{
				name: "Path",
				value: rateLimitInfo.path,
				inline: false
			},{
				name: "Route",
				value: rateLimitInfo.route,
				inline: false
			}
		],
		timestamp: new Date().toISOString(),
		color: 16762455
	};
	embed = new this.Discord.MessageEmbed(data);
	return this.channels.get(this.config.bot.channels.rateLimit).send(embed).catch(error => null);
});