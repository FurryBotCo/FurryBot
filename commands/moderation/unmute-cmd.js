module.exports = {
	triggers: [
		"unmute",
		"um"
	],
	userPermissions: [
		"kickMembers" // 2
	],
	botPermissions: [
		"manageRoles" // 268435456
	],
	cooldown: 2.5e3,
	description: "Remove a mute from someone",
	usage: "<@member/id> [reason]",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let user, embed, reason, a, m;
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
    
		// get member from message
		user = await message.getMemberFromArgs();
        
		if(!user) return message.errorEmbed("INVALID_USER");
    
		//if(user.id === message.member.id && !message.user.isDeveloper) return message.channel.createMessage("Pretty sure you don't want to do this to yourthis.");
		//if(user.roles.highest.rawPosition >= message.member.roles.highest.rawPosition && message.author.id !== message.channel.guild.ownerID) return message.channel.createMessage(`You cannot mute ${user.username}#${user.discriminator} as their highest role is higher than yours!`);
		//if(user.permissions.has("administrator")) return message.channel.createMessage("That user has `ADMINISTRATOR`, that would literally do nothing.");
		reason = message.args.length >= 2 ? message.args.splice(1).join(" ") : "No Reason Specified";
		if(message.gConfig.muteRole === null) {
			embed = {
				title: "No mute role",
				description: `this server does not have a mute role set, you can set this with \`${message.gConfig.prefix}setmuterole <role>\``,
				color: 15601937
			};
			Object.assign(embed, message.embed_defaults("color"));
			return message.channel.createMessage({ embed });
		}
		if(!message.channel.guild.roles.has(message.gConfig.muteRole)) {
			embed = {
				title: "Mute role not found",
				description: `The mute role specified for this server <@&${message.gConfig.muteRole}> (${message.channel.guild.id}) was not found, it has been reset. You can set a new one with \`${message.gConfig.prefix}setmuterole <role>\``,
				color: 15601937
			};
			await this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
				$set: {
					muteRole: null
				}
			});
			Object.assign(embed, message.embed_defaults("color"));
			return message.channel.createMessage({ embed });
		}
		a = this.compareMemberWithRole(message.channel.guild.members.get(this.bot.user.id),message.channel.guild.roles.get(message.gConfig.muteRole));
		if(a.higher || a.same) {
			embed = {
				title: "Invalid mute role",
				description: `The current mute role <@&${message.gConfig.muteRole}> (${message.gConfig.muteRole}) seems to be higher than me, please move it below me. You can set a new one with \`${message.gConfig.prefix}setmuterole <role>\``,
				color: 15601937
			};
			Object.assign(embed, message.embed_defaults("color"));
			return message.channel.createMessage({ embed });
		}
    
		if(!user.roles.includes(message.gConfig.muteRole)) {
			embed = {
				title: "User not muted",
				description: `The user **${user.username}#${user.discriminator}** doesn't seem to be muted.. You can mute them with \`${message.gConfig.prefix}mute @${user.username}#${user.discriminator} [reason]\``,
				color: 15601937
			};
			Object.assign(embed, message.embed_defaults("color"));
			return message.channel.createMessage({ embed });
		}
    
		user.removeRole(message.gConfig.muteRole,`Mute: ${message.author.username}#${message.author.discriminator} -> ${reason}`).then(() => {
			message.channel.createMessage(`***User ${user.username}#${user.discriminator} was unmuted, ${reason}***`).catch(noerr => null);
		}).catch(async(err) => {
			message.channel.createMessage(`I couldn't unmute **${user.username}#${user.discriminator}**, ${err}`);
			if(m !== undefined) {
				await m.delete();
			}
		});
		if(!message.gConfig.deleteCommands && message.channel.permissionsOf(this.bot.user.id).has("manageMessages")) message.delete().catch(error => null);
	})
};