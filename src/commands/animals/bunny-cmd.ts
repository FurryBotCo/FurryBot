import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@src/util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";

export default new Command({
	triggers: [
		"bunny",
		"bun",
		"bunbun"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	description: "Get a picture of a cute bunny!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {

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
		return msg.channel.createMessage("", {
			file: await functions.getImageFromURL(response.media.gif),
			name: `${response.id}.gif`
		});
	} catch (e) {
		this.logger.log(e);
		return msg.channel.createMessage("unknown api error", {
			file: await functions.getImageFromURL(config.images.serverError),
			name: "error.png"
		});
	}
}));