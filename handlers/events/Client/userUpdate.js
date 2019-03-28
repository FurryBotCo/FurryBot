module.exports = (async function(oldUser,newUser) {
	if(!oldUser || !newUser || !this.db) return;
	this.trackEvent({
		group: "EVENTS",
		userId: newUser.id,
		event: "client.events.userUpdate",
		properties: {
			bot: {
				version: this.config.bot.version,
				beta: this.config.beta,
				alpha: this.config.alpha,
				server: this.os.hostname()
			}
		}
	});
	let ev, gConfig, logch, data, embed, base;
	ev = "memberupdated";
	base = {
		title: "Member Updated",
		author: {
			name: `${newUser.tag} (${newUser.id})`,
			icon_url: newUser.avatarURL()
		},
		timestamp: new Date().toISOString(),
		color: this.randomColor(),
		fields: []
	};
	this.guilds.filter(g => g.members.has(newUser.id)).forEach(async(guild) => {
		gConfig = await this.db.getGuild(guild.id).catch(error => this.config.default.guildConfig);
		if(!gConfig || [undefined,null,"",{},[]].includes(gConfig.logging) || [undefined,null,"",{},[]].includes(gConfig.logging[ev]) || !gConfig.logging[ev].enabled || [undefined,null,""].includes(gConfig.logging[ev].channel)) return;
		logch = guild.channels.get(gConfig.logging[ev].channel);
		if(!logch) return this.db.updateGuild(guild.id,{logging:{[ev]:{enabled:false,channel:null}}});

		// username
		if(oldUser.username !== newUser.username) {
			data = Object.assign({  
				footer: {
					text: guild.name,
					icon_url: guild.iconURL()
				}
			},base);

			data.fields = [{
				name: "Old Username",
				value: oldUser.username,
				inline: false
			},{
				name: "New Username",
				value: newUser.username,
				inline: false
			}];

			embed = new this.Discord.MessageEmbed(data);
			logch.send(embed);
		}

		// discriminator
		if(oldUser.discriminator !== newUser.discriminator) {
			data = Object.assign({  
				footer: {
					text: guild.name,
					icon_url: guild.iconURL()
				}
			},base);

			data.fields = [{
				name: "Old Discriminator",
				value: oldUser.discriminator,
				inline: false
			},{
				name: "New Discriminator",
				value: newUser.discriminator,
				inline: false
			}];
            
			embed = new this.Discord.MessageEmbed(data);
			logch.send(embed);
		}

		// avatar
		if(oldUser.displayAvatarURL() !== newUser.displayAvatarURL()) {
			data = Object.assign({  
				footer: {
					text: guild.name,
					icon_url: guild.iconURL()
				}
			},base);

			data.fields = [{
				name: "Old Avatar",
				value: oldUser.displayAvatarURL(),
				inline: false
			},{
				name: "New Avatar",
				value: newUser.displayAvatarURL(),
				inline: false
			}];
            
			embed = new this.Discord.MessageEmbed(data);
			logch.send(embed);
		}
	});
});