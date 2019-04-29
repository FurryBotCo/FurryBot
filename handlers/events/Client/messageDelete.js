module.exports = (async function(message) {
	this.trackEvent({
		group: "EVENTS",
		userId: message.author.id,
		event: "client.events.messageDelete",
		properties: {
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: require("os").hostname()
			}
		}
	});
	if(!this || !this.mdb || !message || !message.author || message.author.bot || message.channel.type !== 0) return;
	if(!message.channel.guild || ![0,2,4].includes(message.channel.type)) return;
	const gConfig = await this.mdb.collection("guilds").findOne({id: message.channel.guild.id}),
		ev = "messagedelete";
	if(!gConfig) return;
	if([undefined,null,""].includes(gConfig.logging[ev])) return this.mdb.collection("guilds").findOneAndUpdate({ id: message.channel.guild.id },{
		$set: {
			[`logging.${ev}`]: {
				enabled: false,
				channel: null
			}
		}
	});
	if(!gConfig.logging[ev].enabled) return;
	const ch = message.channel.guild.channels.get(gConfig.logging[ev].channel);
	if(!ch) return this.mdb.collection("guilds").findOneAndUpdate({ id: message.channel.guild.id },{
		$set: {
			[`logging.${ev}`]: {
				enabled: false,
				channel: null
			}
		}
	});
	let embed;


	embed = {
		author: {
			icon_url: message.channel.guild.iconURL,
			name: message.channel.guild.name
		},
		footer: {
			icon_url: message.author.avatarURL,
			text: `Message Author: ${message.author.username}#${message.author.discriminator}`
		},
		title: "Message Deleted",
		description: `Message by ${message.author.username}#${message.author.discriminator} deleted in <#${message.channel.id}> (${message.channel.name})`,
		fields: [
			{
				name: "Content",
				value: message.content,
				inline: false
			}
		],
		color: this.randomColor(),
		timestamp: this.getCurrentTimestamp()
	};
	return ch.createMessage({ embed }).catch(err => {
		this.logger.error(err);
	});
});