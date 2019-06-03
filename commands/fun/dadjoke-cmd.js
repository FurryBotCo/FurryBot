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
		"dadjoke",
		"joke"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 4e3,
	description: "Get a dadjoke!",
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
		return message.channel.createMessage(`This command has been permanently disabled until Cloudflare stops giving us captchas, join our support server for updates on the status of this: ${config.bot.supportInvite}.`);
		
		/* eslint-disable no-unreachable */
		let req, j;
		req = await this.request("https://icanhazdadjoke.com",{
			headers:{
				Accept: "application/json",
				"User-Agent": config.web.userAgent
			}
		});
		try {
			j = JSON.parse(req.body);
		} catch(e) {
			await message.channel.createMessage("Cloudflare is being dumb and rejecting our requests, please try again later.");
			this.logger.error(req.body);
			return this.logger.error(e);
			//throw e;
		}
	
		return message.channel.createMessage(j.joke);
		/* eslint-enable no-unreachable */
	})
};