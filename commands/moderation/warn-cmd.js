module.exports = {
	triggers: [
		"warn",
		"w"
	],
	userPermissions: [
		"kickMembers" // 2
	],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Warn a user for someting they've done",
	usage: "<@member/id> <reason>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		let user, reason, w, u, embed, a;
		if(message.args.length < 2) return new Error("ERR_INVALID_USAGE");
		// get member from message
		user = await message.getMemberFromArgs();
        
		if(!user) return message.errorEmbed("INVALID_USER");
		u = await this.mdb.collection("users").findOne({id: user.id});
		a = this.compareMembers(user,message.member);
		if(user.id === message.member.id && !message.user.isDeveloper) return message.channel.createMessage("Pretty sure you don't want to do this to yourthis.");
		if((a.member1.higher || a.member1.same) && message.author.id !== message.channel.guild.ownerID && !message.user.isDeveloper) return message.channel.createMessage(`You cannot warn ${user.username}#${user.discriminator} as their highest role is higher than yours!`);
		reason = message.args.slice(1).join(" ");
    
		if(!reason) return message.channel.createMessage("Please provide a reason.");
    
		w = await this.mdb.collection("users").findOneAndUpdate({id: user.id},{$push: {warnings: {wid: u.warnings.length + 1, blame: message.author.id, reason, timestamp: Date.now(), gid: message.channel.guild.id}}});
		if(!message.gConfig.deleteCommands && message.channel.permissionsOf(this.bot.user.id).has("manageMessages")) message.delete().catch(error => null);
		embed = {
			title: `User Warned - #${u.warnings.length + 1}`,
			description: `User ${user.username}#${user.discriminator} was warned by ${message.author.username}#${message.author.discriminator}`,
			fields: [
				{
					name: "Reason",
					value: reason,
					inline: false
				}
			]
		};
		Object.assign(embed,message.embed_defaults());
		return message.channel.createMessage({ embed });
	})
};