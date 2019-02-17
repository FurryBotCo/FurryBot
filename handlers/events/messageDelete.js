module.exports = (async function(message) {
	if(!message || !this.db) return;
	if(!message.channel.guild || !["text","voice","category"].includes(message.channel.type)) return;
	this.analytics.track({
		userId: "CLIENT",
		event: "client.events.messageDelete",
		properties: {
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: this.os.hostname()
			}
		}
	});
	let ev, gConfig, logch, data, embed;
	ev = "messagedeleted";
	gConfig = await this.db.getGuild(message.guild.id).catch(error=>this.config.defaultGuildSettings);
	if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
	logch = message.guild.channels.get(gConfig.logging[ev].channel);
	if(!logch) return this.db.updateGuild(message.guild.id,{logging:{[ev]:{enabled:false,channel:null}}});
	data = {
		title: `Message Deleted in ${message.channel.name} (${message.channel.id})`,
		author: {
			name: message.guild.name,
			icon_url: message.guild.iconURL()
		},
		timestamp: new Date().toISOString(),
		color: this.randomColor(),
		footer: {
			text: `Shard ${![undefined,null].includes(message.guild.shard) ? `${+message.guild.shard.id+1}/${this.options.shardCount}`: "1/1"} | Bot Version ${this.config.bot.version}`
		},
		fields: [
			{
				name: "Content",
				value: message.content,
				inline: false
			},{
				name: "ID",
				value: message.id,
				inline: false
			},{
				name: "Author",
				value: `${message.author.tag} (${message.author.id})`,
				inline: false
			}
		]
	};
	embed = new this.Discord.MessageEmbed(data);
	return logch.send(embed);
});