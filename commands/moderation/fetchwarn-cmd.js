module.exports = {
	triggers: [
		"fetchwarn",
		"fetchwarning"
	],
	userPermissions: [
		"kickMembers" // 2
	],
	botPermissions: [],
	cooldown: 2.5e3,
	description: "Fetch a warning for a specific user",
	usage: "<@member/id> <warning id>",
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
		let user, w, embed, usr, blame;
		// get member from message
		user = await message.getMemberFromArgs();
        
		if(!user) return message.errorEmbed("INVALID_USER");
		if(isNaN(message.args[1])) return message.channel.createMessage(`<@!${message.author.id}>, Please provide a valid warning id as the second argument.`);
    
		w = await this.mdb.collection("users").findOne({id: user.id}).then(res => res.warnings.filter(w => w.wid === parseInt(message.args[1],10) && w.gid === message.channel.guild.id)[0]);
		if(!w) {
			embed = {
				title: "Failure",
				description: `Either you provided an invalid warning id, or there was an internal error. Make sure the user **${user.username}#${user.discriminator}** has a warning with the id ${message.args[1]}, and that the warning is for this server.\n\n(tip: to list warnings use \`${message.gConfig.prefix}warnlog ${user.username}#${user.discriminator}\`)`,
				color: 15601937
			};
			Object.assign(embed,message.embed_defaults("color"));
			return message.channel.createMessage({ embed });
		} else {
			usr = await this.bot.getRESTUser(w.blame).catch(error => null);
			blame = !usr ? "Unknown#0000" : `${usr.username}#${usr.discriminator}`;
			embed = {
				title: `**${user.username}#${user.discriminator}** - Warning #${w.wid}`,
				description: `Blame: ${blame}\nReason: ${w.reason}\nTime: ${new Date(w.timestamp).toDateString()}`,
				color: 41728
			};
			Object.assign(embed,message.embed_defaults("color"));
			return message.channel.createMessage({ embed });
		}
	})
};