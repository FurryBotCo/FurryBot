module.exports = {
	triggers: [
		"delwarn",
		"rmwarn"
	],
	userPermissions: [
		"kickMembers" // 2
	],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Delete a users warning",
	usage: "<@member/id>",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		if(message.args.length < 2) return new Error("ERR_INVALID_USAGE");
		let user, w, data, embed;
		// get member from message
		user = await message.getMemberFromArgs();
    
		if(!user) return message.errorEmbed("INVALID_USER");
    
		if(isNaN(message.args[1])) return message.channel.createMessage(`<@!${message.author.id}>, Please provide a valid warning id as the second argument.`);
	
		w = await this.mdb.collection("users").findOneAndUpdate({id: user.id},{$pull: {warnings: {wid: message.args[1],gid: message.channel.guild.id}}});
		if(!w.ok) {
			embed = {
				title: "Failure",
				description: `Either you provided an invalid warning id, or there was an internal error. Make sure the user **${user.username}#${user.discriminator}** has a warning with the id ${message.args[1]}.`,
				color: 15601937
			};
			Object.assign(embed,message.embed_defaults("color"));
			return message.channel.createMessage({ embed });
		} else {
			embed = {
				title: "Success",
				description: `Deleted warning #${message.args[1]} for user **${user.username}#${user.discriminator}**.`,
				color: 41728
			};
			Object.assign(embed,message.embed_defaults("color"));
			return message.channel.createMessage({ embed });
		}
	})
};