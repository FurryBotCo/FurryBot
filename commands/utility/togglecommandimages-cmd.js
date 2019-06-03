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
		"toggleimages",
		"togglecommandimages"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: [],
	cooldown: 3e3,
	description: "Toggle images on fun commands",
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
    
		switch(message.gConfig.commandImages) {
		case true:
			await mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
				$set: {
					commandImages: false
				}
			});
			message.channel.createMessage("Disabled command images.");
			break;
    
		case false:
			await mdb.collection("guilds").findOneAndUpdate({id: message.channel.guild.id},{
				$set: {
					commandImages: true
				}
			});
			message.channel.createMessage("Enabled command images.");
			break;
		}
	})
};