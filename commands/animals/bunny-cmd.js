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
		"bunny",
		"bun",
		"bunbun"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles" // 32768
	],
	cooldown: 3e3,
	description: "Get a picture of a cute bun!",
	usage: "",
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename),
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function (message) {
		const sub = await functions.processSub(module.exports, message, this);
		if (sub !== "NOSUB") return sub;

		let req, response;
		try {
			req = await phin({
				method: "GET",
				url: "https://api.bunnies.io/v2/loop/random/?media=gif",
				headers: {
					"User-Agent": config.web.userAgent
				}
			});
			response = JSON.parse(req.body);
			return message.channel.createMessage("", {
				file: await functions.getImageFromURL(response.media.gif),
				name: `${response.id}.gif`
			});
		} catch (e) {
			this.logger.log(e);
			return message.channel.createMessage("unknown api error", {
				file: await functions.getImageFromURL(config.images.serverError),
				name: "error.png"
			});
		}
	})
};