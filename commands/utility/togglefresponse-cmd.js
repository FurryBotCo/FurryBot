module.exports = {
	triggers: [
		"togglefresponse",
		"togglef",
		"togglerip",
		"toggleripresponse"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: [],
	cooldown: 3e3,
	description: "Toggles the \"f\" and \"rip\" responses",
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
    
		switch(message.gConfig.fResponseEnabled) {
		case true:
			await this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
				$set: {
					fResponseEnabled: false
				}
			});
			message.channel.createMessage("Disabled f response.");
			break;
    
		case false:
			await this.mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
				$set: {
					fResponseEnabled: true
				}
			});
			message.channel.createMessage("Enabled f response.");
			break;
		}
	})
};