module.exports = {
	triggers: [
		"warn",
		"w"
	],
	userPermissions: [
		"MANAGE_GUILD"
	],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Warn a user for someting they've done",
	usage: "<@member/id> <reason>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		let user, reason, w, data, embed;
		if(message.args.length < 2) return new Error("ERR_INVALID_USAGE");
		// get member from message
		user = await message.getMemberFromArgs();
        
		if(!user) return message.errorEmbed("INVALID_USER");
    
		if(user.id === message.member.id && !message.user.isDeveloper) return message.reply("Pretty sure you don't want to do this to yourmessage.client.");
		if(user.roles.highest.rawPosition >= message.member.roles.highest.rawPosition && message.author.id !== message.guild.owner.id && !message.user.isDeveloper) return message.reply(`You cannot warn ${user.user.tag} as their highest role is higher than yours!`);
		reason = message.args.slice(1).join(" ");
    
		if(!reason) return message.reply("Please provide a reason.");
    
		w = await message.client.db.createUserWarning(user.id,message.guild.id,message.author.id,reason);
    
		if(!message.gConfig.delCmds && message.channel.permissionsFor(message.client.user.id).has("MANAGE_MESSAGES")) message.delete().catch(error => null);
		data = {
			title: `User Warned - #${w.wid}`,
			description: `User ${user.user.tag} was warned by ${message.author.tag}`,
			fields: [
				{
					name: "Reason",
					value: reason,
					inline: false
				}
			]
		};
		Object.assign(data,message.embed_defaults());
		embed = new message.client.Discord.MessageEmbed(data);
		return message.channel.send(embed);
	})
};