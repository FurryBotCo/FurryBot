module.exports = {
	triggers: [
		"setmuterole"
	],
	userPermissions: [
		"MANAGE_GUILD"
	],
	botPermissions: [
		"MANAGE_CHANNELS"
	],
	cooldown: 2.5e3,
	description: "Set the role used to mute people",
	usage: "<@role/role id/role name>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
		let role, data, embed, g;
		if(message.args[0] === "reset") {
			message.guild.channels.forEach(async(ch) => {
				if(![null,undefined,""].includes(message.gConfig.muteRole) && ch.permissionOverwrites.has(message.gConfig.muteRole)) {
					if(ch.permissionOverwrites.get(message.gConfig.muteRole).allow.bitfield === 0 && ch.permissionOverwrites.get(message.gConfig.muteRole).deny.bitfield === 2048) {
						await ch.permissionOverwrites.get(message.gConfig.muteRole).delete();
					} else {
						await ch.permissionOverwrites.get(message.gConfig.muteRole).update({SEND_MESSAGES:null});
					}
				}
			});
			
			await message.client.db.updateGuild(message.guild.id,{muteRole:null});
	
			return message.reply("Reset channel overwrites and mute role.");
		}
		// get role from message
		role = await message.getRoleFromArgs();
	
		if(!role) return message.errorEmbed("INVALID_ROLE");
	
		if(role.managed || role.rawPosition === 0 || role.rawPosition >= message.guild.me.roles.highest.rawPosition) {
			data = {
				title: "Invalid Role",
				description: `this role (<@&${role.id}>) cannot be used as the muted role, check that is not any of these:\n\t- The guilds \`everyone\` role\n\t- A bots role (generated when a bot is invited)\n\t- Higher than me`,
				color: 15601937
			};
			Object.assign(data, message.embed_defaults("color"));
			embed = new message.client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		}
		g = await message.client.db.updateGuild(message.guild.id,{muteRole:role.id});
		if(!g) {
			message.reply("There was an internal error while doing this, please try again");
			return message.client.logger.log(g);
		}
	
		message.reply(`Set the new muted role to **${role.name}**`);
	
		message.guild.channels.forEach(async(ch) => {
			if(![null,undefined,""].includes(message.gConfig.muteRole) && ch.permissionOverwrites.has(message.gConfig.muteRole)) {
				if(ch.permissionOverwrites.get(message.gConfig.muteRole).allow.bitfield === 0 && ch.permissionOverwrites.get(message.gConfig.muteRole).deny.bitfield === 2048) {
					await ch.permissionOverwrites.get(message.gConfig.muteRole).delete();
				} else {
					await ch.permissionOverwrites.get(message.gConfig.muteRole).update({SEND_MESSAGES:null});
				}
			}
			await ch.updateOverwrite(role,{SEND_MESSAGES:false});
		});
	})
};