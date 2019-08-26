import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config";

export default new Command({
	triggers: [
		"snek",
		"snake",
		"noodle",
		"dangernoodle"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "Get a picture of a snek!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let req, j;
	try {
		req = await phin({
			method: "GET",
			url: "https://api.chewey-bot.ga/snake",
			headers: {
				"User-Agent": config.web.userAgent,
				"Authorization": config.apis.chewyBot.key
			}
		});
		j = JSON.parse(req.body);

		return msg.channel.createMessage("", {
			file: await functions.getImageFromURL(j.data),
			name: j.data.split("/").reverse()[0]
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