module.exports = {
	triggers: [
		"unban",
		"ub"
	],
	userPermissions: [
		"banMembers" // 4
	],
	botPermissions: [
		"banMembers" // 4
	],
	cooldown: 2e3,
	description: "Remove bans for people that have been previously banned in your server",
	usage: "<id> [reason]",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let user, embed, reason;
		// get member from message
		if(isNaN(message.args[0])) return message.channel.createMessage("Please provide a user id.");
        
		user = this.bot.users.has(message.args[0]) ? this.bot.users.get(message.args[0]) : await this.getRESTUser(message.args[0]).catch(error => false);
    
		if(!user) return message.errorEmbed("INVALID_USER");

		if(message.channel.permissionsOf(this.bot.user.id).has("viewAuditLogs")) {
			if(!(await message.channel.guild.getBans().then(res => res.map(u => u.user.id))).includes(user.id)) {
				embed = {
					title: "User not banned",
					description: `It doesn't look like ${user.username}#${user.discriminator} is banned here..`
				};
				Object.assign(embed, message.embed_defaults());
				return message.channel.createMessage({ embed });
			}
		}
    
		reason = message.args.length >= 2 ? message.args.splice(1).join(" ") : "No Reason Specified";
		message.channel.guild.unbanMember(user.id,`Unban: ${message.author.username}#${message.author.discriminator} -> ${reason}`).then(() => {
			message.channel.createMessage(`***Unbanned ${user.username}#${user.discriminator}, ${reason}***`).catch(noerr => null);
		}).catch(async(err) => {
			message.channel.createMessage(`I couldn't unban **${user.username}#${user.discriminator}**, ${err}`);
		});
    
		if(!message.gConfig.deleteCommands && message.channel.permissionsOf(this.bot.user.id).has("manageMessages")) message.delete().catch(error => null);
	})
};