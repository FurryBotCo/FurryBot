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
		"discord"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks" // 16384
	],
	cooldown: 2e3,
	description: "Get a link to our Discord support server",
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
		let embed;
		embed = {
			title: "Discord",
			description: `[Join Our Discord Server!](${config.bot.supportInvite})`,
			thumbnail: {
				url: "https://cdn.discordapp.com/embed/avatars/0.png"
			}
		};
		Object.assign(embed,message.embed_defaults());
		message.channel.createMessage({ embed });
	})
};