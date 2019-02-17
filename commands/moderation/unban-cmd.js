module.exports = {
	triggers: [
		"unban",
		"ub"
	],
	userPermissions: [
		"BAN_MEMBERS"
	],
	botPermissions: [
		"BAN_MEMBERS"
	],
	cooldown: 2e3,
	description: "Remove bans for people that have been previously banned in your server",
	usage: "<id> [reason]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		let user, data, embed, reason, m;
		// get member from message
		if(isNaN(message.args[0])) return message.reply("Please provide a user id.");
        
		user = message.client.users.has(message.args[0]) ? message.client.users.get(message.args[0]) : await message.client.users.fetch(message.args[0]).catch(error => false);
    
		if(!user) return message.errorEmbed("INVALID_USER");
		if(!(await message.guild.fetchBans()).has(user.id)) {
			data = {
				title: "User not banned",
				description: `It doesn't look like ${user.tag} is banned here..`
			};
			Object.assign(data, message.embed_defaults());
			embed = new message.client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		}
    
		reason = message.args.length >= 2 ? message.args.splice(1).join(" ") : "No Reason Specified";
		message.guild.members.unban(user.id,{reason:`Unban: ${message.author.tag} -> ${reason}`}).then(() => {
			message.channel.send(`***Unbanned ${user.tag}, ${reason}***`).catch(noerr => null);
		}).catch(async(err) => {
			message.reply(`I couldn't unban **${user.tag}**, ${err}`);
			if(m !== undefined) {
				await m.delete();
			}
		});
    
		if(!message.gConfig.delCmds && message.channel.permissionsFor(message.client.user.id).has("MANAGE_MESSAGES")) message.delete().catch(error => null);
	})
};