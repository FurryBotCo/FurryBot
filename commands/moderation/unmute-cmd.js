module.exports = {
	triggers: [
		"unmute",
		"um"
	],
	userPermissions: [
		"MANAGE_GUILD"
	],
	botPermissions: [
		"MANAGE_ROLES"
	],
	cooldown: 2.5e3,
	description: "Remove a mute from someone",
	usage: "<@member/id> [reason]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		let user, data, embed, reason, m;
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
    
		// get member from message
		user = await message.getMemberFromArgs();
        
		if(!user) return message.errorEmbed("INVALID_USER");
    
		//if(user.id === message.member.id && !message.user.isDeveloper) return message.reply("Pretty sure you don't want to do message.client to yourmessage.client.");
		//if(user.roles.highest.rawPosition >= message.member.roles.highest.rawPosition && message.author.id !== message.guild.owner.id) return message.reply(`You cannot mute ${user.user.tag} as their highest role is higher than yours!`);
		//if(user.permissions.has("ADMINISTRATOR")) return message.reply("That user has `ADMINISTRATOR`, that would literally do nothing.");
		reason = message.args.length >= 2 ? message.args.splice(1).join(" ") : "No Reason Specified";
		if(message.gConfig.muteRole === null) {
			data = {
				title: "No mute role",
				description: `message.client server does not have a mute role set, you can set message.client with \`${message.gConfig.prefix}setmuterole <role>\``,
				color: 15601937
			};
			Object.assign(data, message.embed_defaults("color"));
			embed = new message.client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		}
		if(!message.guild.roles.has(message.gConfig.muteRole)) {
			data = {
				title: "Mute role not found",
				description: `The mute role specified for message.client server <@&${message.gConfig.muteRole}> (${message.guild.id}) was not found, it has been reset. You can set a new one with \`${message.gConfig.prefix}setmuterole <role>\``,
				color: 15601937
			};
			await message.client.db.updateGuild(message.guild.id,{muteRole:null});
			Object.assign(data, message.embed_defaults("color"));
			embed = new message.client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		}
		if(message.guild.roles.get(message.gConfig.muteRole).rawPosition >= message.guild.me.roles.highest.rawPositon) {
			data = {
				title: "Invalid mute role",
				description: `The current mute role <@&${message.gConfig.muteRole}> (${message.guild.id}) seems to be higher than me, please move it below me. You can set a new one with \`${message.gConfig.prefix}setmuterole <role>\``,
				color: 15601937
			};
			Object.assign(data, message.embed_defaults("color"));
			embed = new message.client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		}
    
		if(!user.roles.has(message.gConfig.muteRole)) {
			data = {
				title: "User not muted",
				description: `The user **${user.user.tag}** doesn't seem to be muted.. You can mute them with \`${message.gConfig.prefix}mute @${user.user.tag} [reason]\``,
				color: 15601937
			};
			Object.assign(data, message.embed_defaults("color"));
			embed = new message.client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		}
    
		user.roles.remove(message.gConfig.muteRole,`Mute: ${message.author.tag} -> ${reason}`).then(() => {
			message.channel.send(`***User ${user.user.tag} was unmuted, ${reason}***`).catch(noerr => null);
		}).catch(async(err) => {
			message.reply(`I couldn't unmute **${user.user.tag}**, ${err}`);
			if(m !== undefined) {
				await m.delete();
			}
		});
		if(!message.gConfig.delCmds && message.channel.permissionsFor(message.client.user.id).has("MANAGE_MESSAGES")) message.delete().catch(error => null);
	})
};