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
		"content"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	description: "Get the content count for the image types",
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
		//return message.channel.createMessage("this has been temporarily disabled.");
		let req, counts, txt, content;

		req = await this.request("https://api.furry.bot/counts",{
			method: "GET"
		});
		counts = JSON.parse(req.body);
		
		content = "";
		for(let category in counts) {
			content+=`**${category}**\n`;
			if(counts[category] instanceof Object) {
				for(let level1 in counts[category]) {
					if(counts[category][level1] instanceof Object) {
						content+=`\t${level1}:\n`;
						for(let level2 in counts[category][level1]) {
							if(counts[category][level1][level2] instanceof Object) {
								content+=`\t\t${level2}:\n`;
								for(let level3 in counts[category][level1][level2]) content+=`\t\t\t${level3}: ${counts[category][level1][level2][[level3]]}\n`;
							} else content+=`\t\t${level2}: ${counts[category][level1][level2]}\n`;
						}
					} else content+=`\t${level1}: ${counts[category][level1]}\n`;
				}
			}
		}
		return message.channel.createMessage(content);
	})
};