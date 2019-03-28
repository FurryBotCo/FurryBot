module.exports = {
	triggers: [
		"fetchwarn",
		"fetchwarning"
	],
	userPermissions: [
		"MANAGE_GUILD"
	],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Fetch a warning for a specific user",
	usage: "<@member/id> <warning id>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		if(message.args.length < 2) return new Error("ERR_INVALID_USAGE");
		let user, w, data, embed, usr, blame;
		// get member from message
		user = await message.getMemberFromArgs();
        
		if(!user) return message.errorEmbed("INVALID_USER");
		if(isNaN(message.args[1])) return message.reply("Please provide a valid warning id as the second argument.");
    
		w = await this.db.getUserWarning(user.id,message.guild.id,message.args[1]);
		if(!w) {
			data = {
				title: "Failure",
				description: `Either you provided an invalid warning id, or there was an internal error. Make sure the user **${user.user.tag}** has a warning with the id ${message.args[1]}, and that the warning is for this server.\n\n(tip: to list warnings use \`${message.gConfig.prefix}warnlog ${user.user.tag}\`)`,
				color: 15601937
			};
			Object.assign(data,message.embed_defaults("color"));
			embed = new this.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else {
			usr = await this.users.fetch(w.blame).catch(error => null);
			blame = !usr ? "Unknown#0000" : usr.tag;
			data = {
				title: `**${user.user.tag}** - Warning #${w.wid}`,
				description: `Blame: ${blame}\nReason: ${w.reason}\nTime: ${new Date(w.timestamp).toDateString()}`,
				color: 41728
			};
			Object.assign(data,message.embed_defaults("color"));
			embed = new this.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		}
	})
};