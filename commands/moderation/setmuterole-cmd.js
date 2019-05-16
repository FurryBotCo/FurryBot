module.exports = {
	triggers: [
		"setmuterole"
	],
	userPermissions: [
		"manageGuild" // 32
	],
	botPermissions: [
		"manageChannels" // 16
	],
	cooldown: 2.5e3,
	description: "Set the role used to mute people",
	usage: "<@role/role id/role name>",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		if(message.args.length < 1) return new Error("ERR_INVALID_USAGE");
		
		let role, embed, g, a;
		if(message.args[0] === "reset") {
			message.channel.guild.channels.forEach(async(ch) => {
				if(![null,undefined,""].includes(message.gConfig.muteRole) && ch.permissionOverwrites.has(message.gConfig.muteRole)) {
					if(ch.permissionOverwrites.get(message.gConfig.muteRole).allow.bitfield === 0 && ch.permissionOverwrites.get(message.gConfig.muteRole).deny.bitfield === 2048) {
						await ch.permissionOverwrites.get(message.gConfig.muteRole).delete();
					} else {
						await ch.permissionOverwrites.get(message.gConfig.muteRole).update({SEND_MESSAGES:null});
					}
				}
			});
			
			await this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
				$set: {
					muteRole: null
				}
			});
			return message.channel.createMessage("Reset channel overwrites and mute role.");
		}
		// get role from message
		role = await message.getRoleFromArgs();
	
		if(!role) return message.errorEmbed("INVALID_ROLE");
	
		a = this.compareMemberWithRole(message.channel.guild.members.get(this.bot.user.id),role);
		if(role.managed || role.rawPosition === 0 || a.higher || a.same) {
			embed = {
				title: "Invalid Role",
				description: `this role (<@&${role.id}>) cannot be used as the muted role, check that is not any of these:\n\t- The guilds \`everyone\` role\n\t- A bots role (generated when a bot is invited)\n\t- Higher than me`,
				color: 15601937
			};
			Object.assign(embed, message.embed_defaults("color"));
			return message.channel.createMessage({ embed });
		}
		g = await this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
			$set: {
				muteRole: role.id
			}
		});
		if(!g) {
			message.channel.createMessage("There was an internal error while doing this, please try again");
			return this.logger.log(g);
		}
		await message.channel.createMessage(`Set the new muted role to **${role.name}**`);
		
		message.channel.guild.channels.forEach(async(ch) => {
			if(![null,undefined,""].includes(message.gConfig.muteRole) && ch.permissionOverwrites.has(message.gConfig.muteRole)) {
				if(ch.permissionOverwrites.get(message.gConfig.muteRole).allow === 0 && ch.permissionOverwrites.get(message.gConfig.muteRole).deny === 2048) await ch.deletePermission(message.gConfig.muteRole);
				else await ch.editPermission(message.gConfig.muteRole,ch.permissionOverwrites.get(message.gConfig.muteRole).allow,ch.permissionOverwrites.get(message.gConfig.muteRole).deny - 2048,"role");
			}
			await ch.editPermission(role,ch.permissionOverwrites.has(message.gConfig.muteRole) ? ch.permissionOverwrites.get(message.gConfig.muteRole).allow : 0,2048,"role");
		});
	})
};