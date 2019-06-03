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
		"linkroulette",
		"lr"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles" // 32768s
	],
	cooldown: 3e3,
	description: "Fetches a random short url - high chance to be nsfw!",
	usage: "[sfw/nsfw]",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: true,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		let nsfw, embed;
		if(message.args.length !== 0) {
			nsfw = message.args[0].toLowerCase() === "nsfw";
		}
		let s = await mdb.collection("shorturl").find({ nsfw });

		if(s.length === 0) return message.reply("No results were found.");

		s = s[Math.floor(Math.random() * s.length)];
		if(!s) return message.reply("Invalid selection from db.");

		embed = {
			title: "Link Roulette",
			description: `[${s.link}](${s.link}) - ${s.nsfw ? "NSFW" : "SFW"} - **Link #${s.linkNumber}**`
		};
		
		Object.assign(embed,message.embed_defaults());

		return message.channel.createMessage({ embed });
	})
};