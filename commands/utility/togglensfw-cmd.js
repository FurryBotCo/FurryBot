module.exports = {
	triggers: [
		"togglensfw"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: [],
	cooldown: 3e3,
	description: "Toggle NSFW Commands",
	usage: "",
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
    
		// nsfwModuleEnabled
		switch(message.gConfig.nsfwModuleEnabled) {
		case true:
			await this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
				$set: {
					nsfwModuleEnabled: false
				}
			});
			message.channel.createMessage("Disabled NSFW commands.");
			break;
    
		case false:
			await this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
				$set: {
					nsfwModuleEnabled: true
				}
			});
			message.channel.createMessage("Enabled NSFW commands.");
			break;
		}
	})
};