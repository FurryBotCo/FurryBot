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
		"dog",
		"doggo",
		"puppy"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles" // 32768
	],
	cooldown: 3e3,
	description: "Get a picture of a doggo!",
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
		let req, j, parts;
		try {
			req = await phin({
				method: "GET",
				url: "https://dog.ceo/api/breeds/image/random",
				headers: {
					"User-Agent": config.web.userAgent
				}
			});
			j = JSON.parse(req.body);
			parts = j.message.replace("https://", "").split("/");

			return message.channel.createMessage(`Breed: ${parts[2]}`, {
				file: await functions.getImageFromURL(j.message),
				name: `${parts[2]}_${parts[3]}.png`
			});
		} catch (e) {
			this.logger.error(e);
			return message.channel.createMessage("unknown api error", {
				file: await functions.getImageFromURL(config.images.serverError),
				name: "error.png"
			});
		}
	})
};