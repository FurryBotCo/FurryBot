module.exports = (async function(message,oldMessage) {
	this.trackEvent({
		group: "EVENTS",
		userId: message.author !== "undefined" ? message.author.id : null,
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
	if(!this || !this.mdb || !message || !message.author || message.author.bot || !oldMessage || message.channel.type !== 0 || message.content === oldMessage.content) return;
	this.bot.emit("messageCreate",message);
	if(!message.channel.guild || ![0,2,4].includes(message.channel.type)) return;
	const gConfig = await this.mdb.collection("guilds").findOne({id: message.channel.guild.id}),
		ev = "messageupdate";
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
		title: "Message Edited",
		description: `Message by ${message.author.username}#${message.author.discriminator} edited in <#${message.channel.id}> (${message.channel.id})`,
		fields: [
			{
				name: "Old Content",
				value: oldMessage.content,
				inline: false
			},
			{
				name: "New Content",
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