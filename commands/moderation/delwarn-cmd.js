module.exports = {
	triggers: [
		"delwarn",
		"rmwarn"
	],
	userPermissions: [
		"MANAGE_GUILD"
	],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Delete a users warning",
	usage: "<@member/id>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		if(message.args.length < 2) return new Error("ERR_INVALID_USAGE");
		let user, w, data, embed;
		// get member from message
		user = await message.getMemberFromArgs();
    
		if(!user) return message.errorEmbed("INVALID_USER");
    
		if(isNaN(message.args[1])) return message.reply("Please provide a valid warning id as the second argument.");
    
		w = await this.db.deleteUserWarning(user.id,message.guild.id,message.args[1]);
		console.log(w);
		if(!w) {
			data = {
				title: "Failure",
				description: `Either you provided an invalid warning id, or there was an internal error. Make sure the user **${user.user.tag}** has a warning with the id ${message.args[1]}.`,
				color: 15601937
			};
			Object.assign(data,message.embed_defaults("color"));
			embed = new this.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else {
			data = {
				title: "Success",
				description: `Deleted warning #${message.args[1]} for user **${user.user.tag}**.`,
				color: 41728
			};
			Object.assign(data,message.embed_defaults("color"));
			embed = new this.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		}
	})
};