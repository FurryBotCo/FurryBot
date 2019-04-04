module.exports = class MessageCollector {
	constructor (bot) {
		this.collectors = {};
  
		bot.on("messageCreate", this.verify.bind(this));
	}
  
	async verify (msg) {
		const collector = this.collectors[`${msg.channel.id}-${msg.author.id}`];
		if (collector && collector.filter(msg)) {
			collector.resolve(msg);
		}
	}
  
	awaitMessage (channelId, userId, timeout, filter = () => true) {
		return new Promise(resolve => {
			if (this.collectors[`${channelId}-${userId}`]) {
				delete this.collectors[`${channelId}-${userId}`];
			}
  
			this.collectors[`${channelId}-${userId}`] = { resolve, filter };
  
			setTimeout(resolve.bind(null, false), timeout);
		});
	}
};