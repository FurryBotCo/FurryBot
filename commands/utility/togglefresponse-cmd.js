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
    
		switch(message.gConfig.fResponseEnabled) {
		case true:
			await mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
				$set: {
					fResponseEnabled: false
				}
			});
			message.channel.createMessage("Disabled f response.");
			break;
    
		case false:
			await mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
				$set: {
					fResponseEnabled: true
				}
			});
			message.channel.createMessage("Enabled f response.");
			break;
		}
	})
};