const {
	config,
	functions,
	phin,
	Database: {
		MongoClient,
		mongo,
		mdb
	}
} = require("../../modules/CommandRequire");

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
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
    
		// nsfwModuleEnabled
		switch(message.gConfig.nsfwModuleEnabled) {
		case true:
			await mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
				$set: {
					nsfwModuleEnabled: false
				}
			});
			message.channel.createMessage("Disabled NSFW commands.");
			break;
    
		case false:
			await mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
				$set: {
					nsfwModuleEnabled: true
				}
			});
			message.channel.createMessage("Enabled NSFW commands.");
			break;
		}
	})
};