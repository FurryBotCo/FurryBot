module.exports = {
	triggers: [
		"clearwarnings",
		"warnclear"
	],
	userPermissions: [
		"MANAGE_GUILD"
	],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Clear warnings for a user",
	usage: "<@member/id>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(message) => {
		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		let user, w, data, embed;
		// get member from message
		user = await message.getMemberFromArgs();
    
		if(!user) return message.errorEmbed("INVALID_USER");
		w = await message.client.db.clearUserWarnings(user.id,message.guild.id);
    
		if(!w) {
			data = {
				title: "Failure",
				description: `Either you provided an invalid user, or there was an internal error. Make sure the user **${user.user.tag}** has at least __*one*__ warning before using message.client.`,
				color: 15601937
			};
			Object.assign(data,message.embed_defaults("color"));
			embed = new message.client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		} else {
			data = {
				title: "Success",
				description: `Cleared warnings for user **${user.user.tag}**.`,
				color: 41728
			};
			Object.assign(data,message.embed_defaults("color"));
			embed = new message.client.Discord.MessageEmbed(data);
			return message.channel.send(embed);
		}
	})
};