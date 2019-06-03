const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../modules/CommandRequire");

module.exports = {
	triggers: [
		"mute",
		"m"
	],
	userPermissions: [
		"kickMembers" // 2
	],
	botPermissions: [
		"manageRoles" // 268435456
	],
	cooldown: 2.5e3,
	description: "Stop a user from chatting",
	usage: "<@member/id> [reason]",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		let user, embed, reason, m, a, b;
		// get member from message
		user = await message.getMemberFromArgs();
        
		if(!user) return message.errorEmbed("INVALID_USER");
    
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
				description: `The mute role specified for this server <@&${message.gConfig.muteRole}> (${message.gConfig.muteRole}) was not found, it has been reset. You can set a new one with \`${message.gConfig.prefix}setmuterole <role>\``,
				color: 15601937
			};
			await mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
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
    
		if(user.roles.includes(message.gConfig.muteRole)) {
			embed = {
				title: "User already muted",
				description: `The user **${user.username}#${user.discriminator}** seems to already be muted.. You can unmute them with \`${message.gConfig.prefix}unmute @${user.username}#${user.discriminator} [reason]\``,
				color: 15601937
			};
			Object.assign(embed, message.embed_defaults("color"));
			return message.channel.createMessage({ embed });
		}
        
		if(user.id === message.member.id && !message.user.isDeveloper) return message.channel.createMessage(`${message.author.id}>, Pretty sure you don't want to do this to yourself.`);
		b = this.compareMembers(user,message.member);
		if((b.member2.higher || b.member2.same) && message.author.id !== message.channel.guild.ownerID) return message.channel.createMessage(`<@!${message.author.id}>, You cannot mute ${user.username}#${user.discriminator} as their highest role is higher than yours!`);
		if(user.permission.has("administrator")) return message.channel.createMessage(`<@!${message.author.id}>, That user has the \`ADMINISTRATOR\` permission, that would literally do nothing.`);
		reason = message.args.length >= 2 ? message.args.splice(1).join(" ") : "No Reason Specified";
        
		user.addRole(message.gConfig.muteRole,`Mute: ${message.author.username}#${message.author.discriminator} -> ${reason}`).then(() => {
			message.channel.createMessage(`***User ${user.username}#${user.discriminator} was muted, ${reason}***`).catch(noerr => null);
		}).catch(async(err) => {
			message.channel.createMessage(`<@!${message.author.id}>, I couldn't mute **${user.username}#${user.discriminator}**, ${err}`);
			if(m !== undefined) {
				await m.delete();
			}
		});
		if(!message.gConfig.deleteCommands && message.channel.permissionsOf(this.bot.user.id).has("manageMessages")) message.delete().catch(error => null);
	})
};