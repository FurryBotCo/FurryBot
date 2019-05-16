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
	hasSubCommands: require(`${process.cwd()}/util/functions.js`).hasSubCmds(__dirname,__filename), 
	subCommands: require(`${process.cwd()}/util/functions.js`).subCmds(__dirname,__filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		const sub = await this.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		return message.channel.createMessage(`This command has been permanently disabled until Cloudflare stops giving us captchas, join our support server for updates on the status of this: ${this.config.bot.supportInvite}.`);
		
		/* eslint-disable no-unreachable */
		let req, j;
		req = await this.request("https://icanhazdadjoke.com",{
			headers:{
				Accept: "application/json",
				"User-Agent": this.config.web.userAgent
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