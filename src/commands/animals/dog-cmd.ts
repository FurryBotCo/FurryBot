import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config/config";

export default new Command({
	triggers: [
		"dog",
		"doggo",
		"puppy"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	description: "Get a picture of a doggo!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
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

		return msg.channel.createMessage(`Breed: ${parts[2]}`, {
			file: await functions.getImageFromURL(j.message),
			name: `${parts[2]}_${parts[3]}.png`
		});
	} catch (e) {
		this.logger.error(e, msg.guild.shard.id);
		this.logger.error(j, msg.guild.shard.id);
		return msg.channel.createMessage("unknown api error", {
			file: await functions.getImageFromURL(config.images.serverError),
			name: "error.png"
		});
	}
}));